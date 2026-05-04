from __future__ import annotations

import re
from datetime import date
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, model_validator, validator


class PaymentMethod(str, Enum):
    CREDITO = "CREDITO"
    DEBITO = "DEBITO"
    PAYPAL = "PAYPAL"


class PaymentInfo(BaseModel):
    metodo: PaymentMethod
    nombre_tarjeta: Optional[str] = Field(None, description="Nombre del titular de la tarjeta")
    numero_tarjeta: Optional[str] = Field(None, description="Número de tarjeta solo dígitos")

    @model_validator(mode="after")
    def validar_pago(self) -> "PaymentInfo":
        if self.metodo in {PaymentMethod.CREDITO, PaymentMethod.DEBITO}:
            if not self.nombre_tarjeta or not self.nombre_tarjeta.strip():
                raise ValueError("El nombre del titular es obligatorio para pago con tarjeta.")
            if not re.fullmatch(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$", self.nombre_tarjeta.strip()):
                raise ValueError("El nombre del titular debe contener solo letras y espacios.")
            if not self.numero_tarjeta or not self.numero_tarjeta.isdigit():
                raise ValueError("El número de tarjeta debe ser numérico para pago con tarjeta.")

        if self.metodo == PaymentMethod.PAYPAL:
            if self.nombre_tarjeta or self.numero_tarjeta:
                raise ValueError("PayPal no requiere nombre ni número de tarjeta.")

        return self


class BaseTicketRequest(BaseModel):
    usuario: str
    contrasena: str
    fecha: date
    pago: PaymentInfo
    selected_seats: Optional[List[str]] = None

    @validator("usuario")
    def usuario_mayusculas(cls, v: str) -> str:
        if v != v.upper():
            raise ValueError("El usuario debe estar en mayúsculas.")
        return v

    @validator("selected_seats", each_item=True)
    def validar_asientos(cls, seat: str) -> str:
        if seat is None:
            return seat
        if not isinstance(seat, str) or not seat.strip():
            raise ValueError("Cada asiento debe ser una cadena válida.")
        if not seat.strip().isalnum():
            raise ValueError("El identificador de asiento solo puede contener letras y números.")
        return seat.strip().upper()


class LoginRequest(BaseModel):
    usuario: str
    contrasena: str

    @validator("usuario")
    def usuario_mayusculas(cls, v: str) -> str:
        if v != v.upper():
            raise ValueError("El usuario debe estar en mayúsculas.")
        return v


class TeatroTicketRequest(BaseTicketRequest):
    event_id: str
    boletos: int = Field(..., ge=1)


class CineTicketRequest(BaseTicketRequest):
    event_id: str
    boletos: int = Field(..., ge=1)


class MusicaTicketRequest(BaseTicketRequest):
    event_id: str
    boletos: int = Field(..., ge=1)


class MuseoTicketRequest(BaseTicketRequest):
    venue_id: str
    boletos: int = Field(..., ge=1)


class OrderItem(BaseModel):
    id: str
    usuario: str
    category: str
    event_name: str
    venue: str
    fecha: str
    total: float
    boletos: int
    status: str
    selected_seats: Optional[List[str]] = None


class UserProfile(BaseModel):
    usuario: str
    orders_count: int
    total_spent: float
    total_boletos: int
    próximas_reservas: int
    last_purchase: Optional[str] = None


class TicketResponse(BaseModel):
    purchase_id: str
    mensaje: str
    total: float
    detalles: Optional[Dict[str, Any]] = None
