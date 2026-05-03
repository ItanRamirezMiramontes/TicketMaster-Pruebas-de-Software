from __future__ import annotations

import abc
from datetime import date, datetime
from typing import ClassVar, Dict, Optional, List, Any
from pydantic import BaseModel


class TicketmasterEvent(BaseModel):
    """Modelo para eventos de la API de Ticketmaster"""
    id: str
    name: str
    url: str
    dates: Dict[str, Any]
    classifications: List[Dict[str, Any]]
    _embedded: Optional[Dict[str, Any]] = None
    images: List[Dict[str, Any]]
    priceRanges: Optional[List[Dict[str, Any]]] = None
    promoter: Optional[Dict[str, Any]] = None
    info: Optional[str] = None
    pleaseNote: Optional[str] = None
    products: Optional[List[Dict[str, Any]]] = None

    @property
    def start_date(self) -> Optional[datetime]:
        if self.dates and "start" in self.dates:
            date_str = self.dates["start"].get("dateTime")
            if date_str:
                return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return None

    @property
    def venue_name(self) -> Optional[str]:
        if self._embedded and "venues" in self._embedded:
            return self._embedded["venues"][0]["name"]
        return None

    @property
    def city(self) -> Optional[str]:
        if self._embedded and "venues" in self._embedded:
            return self._embedded["venues"][0]["city"]["name"]
        return None

    @property
    def min_price(self) -> Optional[float]:
        if self.priceRanges:
            return self.priceRanges[0].get("min")
        return None

    @property
    def max_price(self) -> Optional[float]:
        if self.priceRanges:
            return self.priceRanges[0].get("max")
        return None


class TicketmasterVenue(BaseModel):
    """Modelo para venues de la API de Ticketmaster"""
    id: str
    name: str
    type: str
    url: str
    locale: str
    timezone: str
    city: Dict[str, str]
    state: Optional[Dict[str, str]] = None
    country: Dict[str, str]
    address: Optional[Dict[str, str]] = None
    location: Optional[Dict[str, str]] = None
    markets: Optional[List[Dict[str, Any]]] = None
    dmas: Optional[List[Dict[str, Any]]] = None


class Evento(abc.ABC):
    FESTIVOS: ClassVar[set[tuple[int, int]]] = {
        (1, 1),   # Año Nuevo
        (5, 1),   # Día del Trabajo
        (9, 16),  # Día de la Independencia
        (11, 20), # Revolución
        (12, 25), # Navidad
    }

    def __init__(self, fecha: date, boletos: int):
        self.fecha = fecha
        self.boletos = boletos

    @classmethod
    def es_dia_no_laboral(cls, fecha: date) -> bool:
        return (fecha.month, fecha.day) in cls.FESTIVOS

    def validar_fecha(self) -> None:
        if self.es_dia_no_laboral(self.fecha):
            raise ValueError("La compra está bloqueada en días festivos.")

    @abc.abstractmethod
    def validar_compra(self) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    def calcular_total(self) -> float:
        raise NotImplementedError


class Teatro(Evento):
    MAX_BOLETOS: ClassVar[int] = 10

    def __init__(self, event_id: str, boletos: int, fecha: date, event_data: TicketmasterEvent = None):
        super().__init__(fecha=fecha, boletos=boletos)
        self.event_id = event_id
        self.event_data = event_data

    def validar_compra(self) -> None:
        self.validar_fecha()

        if not (1 <= self.boletos <= self.MAX_BOLETOS):
            raise ValueError(f"Máximo {self.MAX_BOLETOS} boletos por usuario para teatro.")

    def calcular_total(self) -> float:
        if self.event_data and self.event_data.min_price:
            return float(self.event_data.min_price * self.boletos)
        return 500.0 * self.boletos  # Precio por defecto


class Cine(Evento):
    MAX_BOLETOS: ClassVar[int] = 10

    def __init__(self, event_id: str, boletos: int, fecha: date, event_data: TicketmasterEvent = None):
        super().__init__(fecha=fecha, boletos=boletos)
        self.event_id = event_id
        self.event_data = event_data

    def validar_compra(self) -> None:
        self.validar_fecha()

        if not (1 <= self.boletos <= self.MAX_BOLETOS):
            raise ValueError(f"Máximo {self.MAX_BOLETOS} boletos por compra para cine.")

    def calcular_total(self) -> float:
        if self.event_data and self.event_data.min_price:
            return float(self.event_data.min_price * self.boletos)
        return 650.0 * self.boletos  # Precio por defecto


class Museo(Evento):
    MAX_BOLETOS: ClassVar[int] = 5

    def __init__(self, venue_id: str, boletos: int, fecha: date, venue_data: TicketmasterVenue = None):
        super().__init__(fecha=fecha, boletos=boletos)
        self.venue_id = venue_id
        self.venue_data = venue_data

    def validar_compra(self) -> None:
        self.validar_fecha()

        if not (1 <= self.boletos <= self.MAX_BOLETOS):
            raise ValueError(f"Máximo {self.MAX_BOLETOS} boletos por usuario para museo.")

    def calcular_total(self) -> float:
        return 220.0 * self.boletos  # Precio fijo para museos


class Pago:
    METODOS_VALIDOS: ClassVar[set[str]] = {"CREDITO", "DEBITO", "PAYPAL"}
    TARJETA_PATTERN = re.compile(r'^\d+$')
    NOMBRE_PATTERN = re.compile(r'^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$')

    @staticmethod
    def procesar_pago(metodo: str, nombre_tarjeta: Optional[str], numero_tarjeta: Optional[str]) -> None:
        metodo_final = metodo.strip().upper()

        if metodo_final not in Pago.METODOS_VALIDOS:
            raise ValueError(f"Método de pago inválido: {metodo}.")

        if metodo_final == "PAYPAL":
            return

        if not nombre_tarjeta or not Pago.NOMBRE_PATTERN.fullmatch(nombre_tarjeta.strip()):
            raise ValueError("El nombre del titular debe contener solo texto y espacios.")

        if not numero_tarjeta or not Pago.TARJETA_PATTERN.fullmatch(numero_tarjeta.strip()):
            raise ValueError("El número de tarjeta debe contener solo dígitos.")
