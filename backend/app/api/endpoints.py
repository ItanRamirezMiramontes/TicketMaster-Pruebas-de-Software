from datetime import date
from enum import Enum
from uuid import uuid4
from typing import List

from fastapi import APIRouter, HTTPException

from app.core.security import Security
from app.core.ticketmaster_api import ticketmaster_api
from app.models.events import Cine, Concierto, Museo, Pago, Teatro, TicketmasterEvent, TicketmasterVenue, MUSEO_OCUPACION
from app.schemas.ticket import (
    CineTicketRequest,
    LoginRequest,
    MuseoTicketRequest,
    MusicaTicketRequest,
    TeatroTicketRequest,
    TicketResponse,
)

router = APIRouter()

TEATRO_ORDENES: list[dict] = []
CINE_ORDENES: list[dict] = []
MUSICA_ORDENES: list[dict] = []
MUSEO_ORDENES: list[dict] = []
USUARIOS_REGISTRADOS: dict[str, str] = {}  # usuario -> contrasena


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
) -> dict[str, str]:
    return {
        "boletos": boletos,
        "horario_entrada": horario,
        "restricciones": restricciones,
        "lugar": lugar,
        "descripcion": descripcion,
    }


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


@router.get("/venues/museo")
async def get_museo_venues(city: str = None, size: int = 20) -> List[TicketmasterVenue]:
    """Obtener venues de museo desde Ticketmaster API"""
    try:
        data = await ticketmaster_api.get_venues(city=city, size=size)
        venues = [TicketmasterVenue(**venue) for venue in data.get("_embedded", {}).get("venues", []) if "museum" in venue.get("type", "").lower()]
        return venues
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener venues de museo: {str(e)}")


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
        ),
    )
