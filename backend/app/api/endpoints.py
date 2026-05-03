from datetime import date
from enum import Enum
from uuid import uuid4
from typing import List

from fastapi import APIRouter, HTTPException

from app.core.security import Security
from app.core.ticketmaster_api import ticketmaster_api
from app.models.events import Cine, Museo, Pago, Teatro, TicketmasterEvent, TicketmasterVenue
from app.schemas.ticket import (
    CineTicketRequest,
    LoginRequest,
    MuseoTicketRequest,
    TeatroTicketRequest,
    TicketResponse,
)

router = APIRouter()

TEATRO_ORDENES: list[dict] = []
CINE_ORDENES: list[dict] = []
MUSEO_ORDENES: list[dict] = []
MUSEO_OCUPACION: dict[str, int] = {
    "LOUVRE": 0,
    "VATICANO": 0,
    "MET": 0,
    "ANTROPOLOGÍA": 0,
    "MNAC": 0,
}
USUARIOS_REGISTRADOS: dict[str, str] = {}  # usuario -> contrasena


def validar_login(usuario: str, contrasena: str) -> None:
    if not Security.validar_usuario(usuario):
        raise HTTPException(status_code=400, detail="Usuario inválido o formato incorrecto.")

    if not Security.validar_contrasena(contrasena):
        raise HTTPException(status_code=400, detail="Contraseña inválida o formato incorrecto.")

    if usuario not in USUARIOS_REGISTRADOS or USUARIOS_REGISTRADOS[usuario] != contrasena:
        raise HTTPException(status_code=401, detail="Usuario no registrado o contraseña incorrecta.")


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

    # Obtener detalles del evento desde Ticketmaster API
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
    )


@router.post("/tickets/cine", response_model=TicketResponse)
async def comprar_cine(request: CineTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    # Obtener detalles del evento desde Ticketmaster API
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
    )


@router.post("/tickets/museo", response_model=TicketResponse)
async def comprar_museo(request: MuseoTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    # Para museos, usamos venue_id directamente (no hay API específica para eventos de museo)
    # Podríamos buscar el venue, pero por simplicidad, asumimos que el venue_id es válido
    venue_data = None  # Podríamos implementar búsqueda de venue si es necesario

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
        "boletos": request.boletos,
        "fecha": request.fecha.isoformat(),
        "total": total,
    })

    return TicketResponse(
        purchase_id=purchase_id,
        mensaje="Compra de museo registrada correctamente.",
        total=total,
    )
