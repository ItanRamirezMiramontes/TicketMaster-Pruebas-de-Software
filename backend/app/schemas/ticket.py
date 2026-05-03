from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Any, Dict, Optional

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

    @validator("usuario")
    def usuario_mayusculas(cls, v: str) -> str:
        if v != v.upper():
            raise ValueError("El usuario debe estar en mayúsculas.")
        return v


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


class MuseoTicketRequest(BaseTicketRequest):
    venue_id: str
    boletos: int = Field(..., ge=1)


class TicketResponse(BaseModel):
    purchase_id: str
    mensaje: str
    total: float
    detalles: Optional[Dict[str, Any]] = None
