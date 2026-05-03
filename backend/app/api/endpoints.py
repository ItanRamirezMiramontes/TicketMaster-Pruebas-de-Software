from datetime import date
from enum import Enum
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.core.security import Security
from app.models.events import Cine, Museo, Pago, Teatro
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


@router.post("/tickets/teatro", response_model=TicketResponse)
def comprar_teatro(request: TeatroTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    teatro = Teatro(
        sede=request.sede,
        obra=request.obra,
        seccion=request.seccion,
        boletos=request.boletos,
        fecha=request.fecha,
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
        "sede": request.sede,
        "obra": request.obra,
        "seccion": request.seccion,
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
def comprar_cine(request: CineTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    cine = Cine(
        establecimiento=request.establecimiento,
        tipo_servicio=request.tipo_servicio,
        clasificacion=request.clasificacion,
        boletos=request.boletos,
        fecha=request.fecha,
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
        "establecimiento": request.establecimiento,
        "tipo_servicio": request.tipo_servicio,
        "clasificacion": request.clasificacion,
        "boletos": request.boletos,
        "fecha": request.fecha.isoformat(),
        "total": total,
    })

    return TicketResponse(
        purchase_id=purchase_id,
        mensaje="Compra de cine registrada correctamente.",
        total=total,
        detalles={"restricciones": cine.obtener_restricciones()},
    )


@router.post("/tickets/museo", response_model=TicketResponse)
def comprar_museo(request: MuseoTicketRequest) -> TicketResponse:
    validar_login(request.usuario, request.contrasena)

    sede_normalizada = request.sede.strip().upper()
    ocupacion_actual = MUSEO_OCUPACION.get(sede_normalizada, 0)

    museo = Museo(
        sede=request.sede,
        boletos=request.boletos,
        fecha=request.fecha,
        ocupacion_actual=ocupacion_actual,
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
        "sede": request.sede,
        "boletos": request.boletos,
        "fecha": request.fecha.isoformat(),
        "total": total,
    })
    MUSEO_OCUPACION[sede_normalizada] = ocupacion_actual + request.boletos

    return TicketResponse(
        purchase_id=purchase_id,
        mensaje="Compra de museo registrada correctamente.",
        total=total,
    )
