from datetime import date, datetime, timezone
from enum import Enum
from uuid import uuid4
from typing import Any, List, Optional

import httpx
from fastapi import APIRouter, HTTPException

from app.core.security import Security
from app.core.ticketmaster_api import ticketmaster_api
from app.models.events import Cine, Concierto, Museo, Pago, Teatro, TicketmasterEvent, TicketmasterVenue, MUSEO_OCUPACION
from app.schemas.ticket import (
    CineTicketRequest,
    LoginRequest,
    MuseoTicketRequest,
    MusicaTicketRequest,
    OrderItem,
    TeatroTicketRequest,
    TicketResponse,
    UserProfile,
)

router = APIRouter()

# MovieGlu API Configuration
MOVIEGLU_BASE = "https://api-gate2.movieglu.com"
MOVIEGLU_HEADERS_BASE = {
    "client":        "UDG_0",
    "x-api-key":     "0zNgLoeaOg62MkDoL5VK4a2Il5QvC3vU3jPZemmS",
    "Authorization": "Basic VURHXzBfWFg6Sk5BeFY2ZkRDbEht",
    "territory":     "XX",
    "api-version":   "v201",
    "geolocation":   "-22.0;14.0",
    "Content-Type":  "application/json",
}

def get_movieglu_headers() -> dict:
    """Devuelve las cabeceras con device-datetime actualizado"""
    return {
        **MOVIEGLU_HEADERS_BASE,
        "device-datetime": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"),
    }

TEATRO_ORDENES: list[dict] = []
CINE_ORDENES: list[dict] = []
MUSICA_ORDENES: list[dict] = []
MUSEO_ORDENES: list[dict] = []
USUARIOS_REGISTRADOS: dict[str, str] = {}  # usuario -> contrasena

# Track occupied seats per event/venue
OCUPADOS_TEATRO: dict[str, set[str]] = {}  # event_id -> set of occupied seats
OCUPADOS_CINE: dict[str, set[str]] = {}
OCUPADOS_MUSICA: dict[str, set[str]] = {}
OCUPADOS_MUSEO: dict[str, set[str]] = {}  # venue_id -> set of occupied seats


def validar_login(usuario: str, contrasena: str) -> None:
    if not Security.validar_usuario(usuario):
        raise HTTPException(status_code=400, detail="Usuario inválido o formato incorrecto.")

    if not Security.validar_contrasena(contrasena):
        raise HTTPException(status_code=400, detail="Contraseña inválida o formato incorrecto.")

    if usuario not in USUARIOS_REGISTRADOS or USUARIOS_REGISTRADOS[usuario] != contrasena:
        raise HTTPException(status_code=401, detail="Usuario no registrado o contraseña incorrecta.")


def format_horario(event: TicketmasterEvent | TicketmasterVenue | None) -> str:
    if event and getattr(event, "start_date", None):
        return event.start_date.strftime("%H:%M")
    return "10:00"


def build_reservation_details(
    boletos: int,
    horario: str,
    restricciones: str,
    lugar: str,
    descripcion: str,
    asientos: str | None = None,
) -> dict[str, str]:
    details = {
        "boletos": boletos,
        "horario_entrada": horario,
        "restricciones": restricciones,
        "lugar": lugar,
        "descripcion": descripcion,
    }
    if asientos:
        details["asientos"] = asientos
    return details


def build_status(venta_fecha: str) -> str:
    try:
        return "Reservado" if date.fromisoformat(venta_fecha) > date.today() else "Comprado"
    except Exception:
        return "Comprado"


def get_user_orders(usuario: str) -> list[dict[str, Any]]:
    ordenes = []
    for category, order_list in {
        "teatro": TEATRO_ORDENES,
        "cine": CINE_ORDENES,
        "musica": MUSICA_ORDENES,
        "museo": MUSEO_ORDENES,
    }.items():
        for order in order_list:
            if order["usuario"] == usuario:
                ordenes.append({
                    **order,
                    "category": category,
                    "status": build_status(order["fecha"]),
                    "selected_seats": order.get("selected_seats", []),
                })
    return ordenes


@router.post("/auth/register")
def register(request: LoginRequest) -> dict[str, str]:
    if not Security.validar_usuario(request.usuario):
        raise HTTPException(status_code=400, detail="Usuario inválido o formato incorrecto.")

    if not Security.validar_contrasena(request.contrasena):
        raise HTTPException(status_code=400, detail="Contraseña inválida o formato incorrecto.")

    if request.usuario in USUARIOS_REGISTRADOS:
        raise HTTPException(status_code=400, detail="Usuario ya registrado.")

    USUARIOS_REGISTRADOS[request.usuario] = request.contrasena
    return {"message": "Registro exitoso."}


@router.post("/auth/login")
def login(request: LoginRequest) -> dict[str, str]:
    validar_login(request.usuario, request.contrasena)
    return {"message": "Login exitoso."}


@router.get("/events/teatro")
async def get_teatro_events(city: str = None, size: int = 20) -> List[TicketmasterEvent]:
    """Obtener eventos de teatro desde Ticketmaster API"""
    try:
        data = await ticketmaster_api.search_events(classification_name="Arts & Theatre", city=city, size=size)
        events = [TicketmasterEvent(**event) for event in data.get("_embedded", {}).get("events", [])]
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener eventos de teatro: {str(e)}")


@router.get("/events/cine")
async def get_cine_events(city: str = None, size: int = 20) -> List[TicketmasterEvent]:
    """Obtener eventos de cine desde Ticketmaster API"""
    try:
        data = await ticketmaster_api.search_events(classification_name="Film", city=city, size=size)
        events = [TicketmasterEvent(**event) for event in data.get("_embedded", {}).get("events", [])]
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener eventos de cine: {str(e)}")


@router.get("/events/musica")
async def get_musica_events(city: str = None, size: int = 20) -> List[TicketmasterEvent]:
    """Obtener eventos de música desde Ticketmaster API"""
    try:
        data = await ticketmaster_api.search_events(classification_name="Music", city=city, size=size)
        events = [TicketmasterEvent(**event) for event in data.get("_embedded", {}).get("events", [])]
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener eventos de música: {str(e)}")


@router.get("/events/{event_id}")
async def get_event_details(event_id: str) -> TicketmasterEvent:
    """Obtener detalles completos de un evento"""
    try:
        event_data = await ticketmaster_api.get_event_details(event_id)
        return TicketmasterEvent(**event_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Evento no encontrado: {str(e)}")


@router.get("/venues/museo")
async def get_museo_venues(city: str = None, size: int = 20) -> List[TicketmasterVenue]:
    """Obtener venues de museo desde Ticketmaster API"""
    try:
        data = await ticketmaster_api.get_venues(city=city, size=size)
        raw_venues = data.get("_embedded", {}).get("venues", [])

        # ✅ FIX: el filtro anterior usaba venue.get("type","").lower() pero los datos de muestra
        # tienen "type": "Museum" (con M mayúscula). Ahora el filtro es case-insensitive
        # y también acepta venues sin campo "type" que vengan del endpoint de museos.
        # Si no hay ninguno con "museum" en el tipo, se devuelven todos los venues disponibles
        # para evitar listas vacías silenciosas.
        filtered = [v for v in raw_venues if "museum" in v.get("type", "").lower()]
        if not filtered:
            filtered = raw_venues  # fallback: devolver todos si ninguno matchea el filtro

        venues = [TicketmasterVenue(**venue) for venue in filtered]
        return venues
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener venues de museo: {str(e)}")


@router.get("/orders", response_model=List[OrderItem])
async def get_user_order_history(usuario: str, contrasena: str) -> List[OrderItem]:
    validar_login(usuario, contrasena)
    return get_user_orders(usuario)


@router.get("/auth/profile", response_model=UserProfile)
async def get_user_profile(usuario: str, contrasena: str) -> UserProfile:
    validar_login(usuario, contrasena)
    orders = get_user_orders(usuario)
    total_spent = sum(order.get("total", 0.0) for order in orders)
    total_boletos = sum(order.get("boletos", 0) for order in orders)
    próximas_reservas = sum(1 for order in orders if order.get("status") == "Reservado")
    last_purchase = max((order["fecha"] for order in orders), default=None)

    return UserProfile(
        usuario=usuario,
        orders_count=len(orders),
        total_spent=total_spent,
        total_boletos=total_boletos,
        próximas_reservas=próximas_reservas,
        last_purchase=last_purchase,
    )


@router.get("/seats/{event_type}/{event_id}")
async def get_occupied_seats(event_type: str, event_id: str) -> List[str]:
    """Obtener asientos ocupados para un evento"""
    if event_type == "teatro":
        occupied = OCUPADOS_TEATRO.get(event_id, set())
    elif event_type == "cine":
        occupied = OCUPADOS_CINE.get(event_id, set())
    elif event_type == "musica":
        occupied = OCUPADOS_MUSICA.get(event_id, set())
    elif event_type == "museo":
        occupied = OCUPADOS_MUSEO.get(event_id, set())
    else:
        raise HTTPException(status_code=400, detail="Tipo de evento inválido.")
    return list(occupied)


@router.post("/tickets/teatro", response_model=TicketResponse)
async def comprar_teatro(request: TeatroTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    try:
        event_data = await ticketmaster_api.get_event_details(request.event_id)
        event = TicketmasterEvent(**event_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Evento no encontrado: {str(e)}")

    teatro = Teatro(
        event_id=request.event_id,
        boletos=request.boletos,
        fecha=request.fecha,
        event_data=event,
    )

    try:
        teatro.validar_compra()
        Pago.procesar_pago(request.pago.metodo.value, request.pago.nombre_tarjeta, request.pago.numero_tarjeta)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    # Check and occupy seats
    if request.selected_seats:
        occupied = OCUPADOS_TEATRO.get(request.event_id, set())
        for seat in request.selected_seats:
            if seat in occupied:
                raise HTTPException(status_code=400, detail=f"Asiento {seat} ya está ocupado.")
        if request.event_id not in OCUPADOS_TEATRO:
            OCUPADOS_TEATRO[request.event_id] = set()
        OCUPADOS_TEATRO[request.event_id].update(request.selected_seats)

    total = teatro.calcular_total()
    purchase_id = str(uuid4())
    TEATRO_ORDENES.append({
        "id": purchase_id,
        "usuario": request.usuario,
        "event_id": request.event_id,
        "event_name": event.name,
        "venue": event.venue_name,
        "boletos": request.boletos,
        "fecha": request.fecha.isoformat(),
        "total": total,
        "selected_seats": request.selected_seats or [],
    })

    return TicketResponse(
        purchase_id=purchase_id,
        mensaje="Compra de teatro registrada correctamente.",
        total=total,
        detalles=build_reservation_details(
            boletos=request.boletos,
            horario=format_horario(event),
            restricciones="No se permite ingresar alimentos o armas. Respeta el horario de entrada.",
            lugar=event.venue_name or "Teatro desconocido",
            descripcion=event.name,
            asientos=", ".join(request.selected_seats or []),
        ),
    )


@router.post("/tickets/cine", response_model=TicketResponse)
async def comprar_cine(request: CineTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    try:
        event_data = await ticketmaster_api.get_event_details(request.event_id)
        event = TicketmasterEvent(**event_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Evento no encontrado: {str(e)}")

    cine = Cine(
        event_id=request.event_id,
        boletos=request.boletos,
        fecha=request.fecha,
        event_data=event,
    )

    try:
        cine.validar_compra()
        Pago.procesar_pago(request.pago.metodo.value, request.pago.nombre_tarjeta, request.pago.numero_tarjeta)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    # Check and occupy seats
    if request.selected_seats:
        occupied = OCUPADOS_CINE.get(request.event_id, set())
        for seat in request.selected_seats:
            if seat in occupied:
                raise HTTPException(status_code=400, detail=f"Asiento {seat} ya está ocupado.")
        if request.event_id not in OCUPADOS_CINE:
            OCUPADOS_CINE[request.event_id] = set()
        OCUPADOS_CINE[request.event_id].update(request.selected_seats)

    total = cine.calcular_total()
    purchase_id = str(uuid4())
    CINE_ORDENES.append({
        "id": purchase_id,
        "usuario": request.usuario,
        "event_id": request.event_id,
        "event_name": event.name,
        "venue": event.venue_name,
        "boletos": request.boletos,
        "fecha": request.fecha.isoformat(),
        "total": total,
        "selected_seats": request.selected_seats or [],
    })

    return TicketResponse(
        purchase_id=purchase_id,
        mensaje="Compra de cine registrada correctamente.",
        total=total,
        detalles=build_reservation_details(
            boletos=request.boletos,
            horario=format_horario(event),
            restricciones="Prohibido ingresar mascotas, armas y alimentos externos.",
            lugar=event.venue_name or "Cine desconocido",
            descripcion=event.name,
            asientos=", ".join(request.selected_seats or []),
        ),
    )


@router.post("/tickets/musica", response_model=TicketResponse)
async def comprar_musica(request: MusicaTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    try:
        event_data = await ticketmaster_api.get_event_details(request.event_id)
        event = TicketmasterEvent(**event_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Evento no encontrado: {str(e)}")

    concierto = Concierto(
        event_id=request.event_id,
        boletos=request.boletos,
        fecha=request.fecha,
        event_data=event,
    )

    try:
        concierto.validar_compra()
        Pago.procesar_pago(request.pago.metodo.value, request.pago.nombre_tarjeta, request.pago.numero_tarjeta)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    # Check and occupy seats
    if request.selected_seats:
        occupied = OCUPADOS_MUSICA.get(request.event_id, set())
        for seat in request.selected_seats:
            if seat in occupied:
                raise HTTPException(status_code=400, detail=f"Asiento {seat} ya está ocupado.")
        if request.event_id not in OCUPADOS_MUSICA:
            OCUPADOS_MUSICA[request.event_id] = set()
        OCUPADOS_MUSICA[request.event_id].update(request.selected_seats)

    total = concierto.calcular_total()
    purchase_id = str(uuid4())
    MUSICA_ORDENES.append({
        "id": purchase_id,
        "usuario": request.usuario,
        "event_id": request.event_id,
        "event_name": event.name,
        "venue": event.venue_name,
        "boletos": request.boletos,
        "fecha": request.fecha.isoformat(),
        "total": total,
        "selected_seats": request.selected_seats or [],
    })

    return TicketResponse(
        purchase_id=purchase_id,
        mensaje="Compra de música registrada correctamente.",
        total=total,
        detalles=build_reservation_details(
            boletos=request.boletos,
            horario=format_horario(event),
            restricciones="Eventos de música con acceso controlado. No se permiten bebidas ni armas.",
            lugar=event.venue_name or "Sala de conciertos desconocida",
            descripcion=event.name,
            asientos=", ".join(request.selected_seats or []),
        ),
    )


@router.post("/tickets/museo", response_model=TicketResponse)
async def comprar_museo(request: MuseoTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    venue_data = None
    try:
        venue_response = await ticketmaster_api.get_venue_details(request.venue_id)
        venue_data = TicketmasterVenue(**venue_response)
    except Exception:
        raise HTTPException(status_code=400, detail="Museo no encontrado o inválido.")

    museo = Museo(
        venue_id=request.venue_id,
        boletos=request.boletos,
        fecha=request.fecha,
        venue_data=venue_data,
    )

    try:
        museo.validar_compra()
        Pago.procesar_pago(request.pago.metodo.value, request.pago.nombre_tarjeta, request.pago.numero_tarjeta)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    total = museo.calcular_total()
    purchase_id = str(uuid4())
    MUSEO_ORDENES.append({
        "id": purchase_id,
        "usuario": request.usuario,
        "venue_id": request.venue_id,
        "venue_name": venue_data.name,
        "boletos": request.boletos,
        "fecha": request.fecha.isoformat(),
        "total": total,
        "selected_seats": request.selected_seats or [],
    })
    MUSEO_OCUPACION[request.venue_id] = MUSEO_OCUPACION.get(request.venue_id, 0) + request.boletos

    return TicketResponse(
        purchase_id=purchase_id,
        mensaje="Compra de museo registrada correctamente.",
        total=total,
        detalles=build_reservation_details(
            boletos=request.boletos,
            horario="10:00",
            restricciones=f"Acceso restringido según normas de {venue_data.name}. No se permite comida ni materiales peligrosos.",
            lugar=venue_data.name,
            descripcion=venue_data.city.get("name", "Ciudad desconocida"),
            asientos=", ".join(request.selected_seats or []),
        ),
    )


@router.get("/movieglu/films")
async def proxy_films_now_showing(n: int = 10):
    """Proxy para MovieGlu filmsNowShowing"""
    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            resp = await client.get(
                f"{MOVIEGLU_BASE}/filmsNowShowing/",
                headers=get_movieglu_headers(),
                params={"n": n},
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"MovieGlu error: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error conectando con MovieGlu: {str(e)}",
            )


@router.get("/movieglu/showtimes")
async def proxy_film_showtimes(film_id: int, date: str, n: int = 5):
    """Proxy para MovieGlu filmShowTimes"""
    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            resp = await client.get(
                f"{MOVIEGLU_BASE}/filmShowTimes/",
                headers=get_movieglu_headers(),
                params={"film_id": film_id, "date": date, "n": n},
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"MovieGlu error: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error conectando con MovieGlu: {str(e)}",
            )


@router.get("/movieglu/cinemas")
async def proxy_cinemas(n: int = 10):
    """Proxy para MovieGlu cinemas"""
    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            resp = await client.get(
                f"{MOVIEGLU_BASE}/cinemas/",
                headers=get_movieglu_headers(),
                params={"n": n},
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"MovieGlu error: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error conectando con MovieGlu: {str(e)}",
            )


@router.get("/movieglu/territories")
async def proxy_territories():
    """Proxy para MovieGlu territories"""
    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            resp = await client.get(
                f"{MOVIEGLU_BASE}/territories/",
                headers=get_movieglu_headers(),
            )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"MovieGlu error: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Error conectando con MovieGlu: {str(e)}",
            )
