from __future__ import annotations

import abc
import re
from datetime import date
from typing import ClassVar, Dict, Optional


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
    SEDES: ClassVar[Dict[str, list[str]]] = {
        "COLÓN": ["El Fantasma", "El Sueño", "La Dama"] ,
        "SCALA": ["Historia Viva", "La Orquesta", "El Sueño"],
        "METROPÓLITAN": ["El Viaje", "Memorias", "El Duelo"],
    }
    SECCIONES_PRECIOS: ClassVar[Dict[str, int]] = {
        "LUNETA": 500,
        "PALCO": 800,
        "PREFERENTE": 300,
    }
    MAX_BOLETOS: ClassVar[int] = 10

    def __init__(self, sede: str, obra: str, seccion: str, boletos: int, fecha: date):
        super().__init__(fecha=fecha, boletos=boletos)
        self.sede = sede.strip().upper()
        self.obra = obra.strip()
        self.seccion = seccion.strip().upper()

    def validar_compra(self) -> None:
        self.validar_fecha()

        if self.sede not in self.SEDES:
            raise ValueError(f"Sede de teatro inválida: {self.sede}.")

        if self.obra not in self.SEDES[self.sede]:
            raise ValueError(f"Obra inválida para {self.sede}: {self.obra}.")

        if self.seccion not in self.SECCIONES_PRECIOS:
            raise ValueError(f"Sección inválida: {self.seccion}.")

        if not (1 <= self.boletos <= self.MAX_BOLETOS):
            raise ValueError(f"Máximo {self.MAX_BOLETOS} boletos por usuario para teatro.")

    def calcular_total(self) -> float:
        precio_unitario = self.SECCIONES_PRECIOS[self.seccion]
        return float(precio_unitario * self.boletos)


class Cine(Evento):
    ESTABLECIMIENTOS: ClassVar[list[str]] = ["CINEMEX", "CINEMARK", "OXFORD", "CINESA"]
    SERVICIOS: ClassVar[Dict[str, int]] = {
        "VIP": 650,
        "IMAX": 780,
        "4DX": 920,
    }
    CLASIFICACIONES: ClassVar[list[str]] = ["AA", "A", "B", "B15", "C", "D"]
    RESTRICCIONES: ClassVar[str] = "Prohibido ingresar mascotas, armas y alimentos externos."
    MAX_BOLETOS: ClassVar[int] = 10

    def __init__(self, establecimiento: str, tipo_servicio: str, clasificacion: str, boletos: int, fecha: date):
        super().__init__(fecha=fecha, boletos=boletos)
        self.establecimiento = establecimiento.strip().upper()
        self.tipo_servicio = tipo_servicio.strip().upper()
        self.clasificacion = clasificacion.strip().upper()

    def validar_compra(self) -> None:
        self.validar_fecha()

        if self.establecimiento not in self.ESTABLECIMIENTOS:
            raise ValueError(f"Establecimiento de cine inválido: {self.establecimiento}.")

        if self.tipo_servicio not in self.SERVICIOS:
            raise ValueError(f"Tipo de servicio inválido para cine: {self.tipo_servicio}.")

        if self.clasificacion not in self.CLASIFICACIONES:
            raise ValueError(f"Clasificación de película inválida: {self.clasificacion}.")

        if not (1 <= self.boletos <= self.MAX_BOLETOS):
            raise ValueError(f"Máximo {self.MAX_BOLETOS} boletos por compra para cine.")

    def calcular_total(self) -> float:
        precio_unitario = self.SERVICIOS[self.tipo_servicio]
        return float(precio_unitario * self.boletos)

    def obtener_restricciones(self) -> str:
        return self.RESTRICCIONES


class Museo(Evento):
    CAPACIDADES: ClassVar[Dict[str, int]] = {
        "LOUVRE": 500,
        "VATICANO": 400,
        "MET": 450,
        "ANTROPOLOGÍA": 300,
        "MNAC": 250,
    }
    MAX_BOLETOS: ClassVar[int] = 5
    PRECIO_BOLETO: ClassVar[float] = 220.0

    def __init__(self, sede: str, boletos: int, fecha: date, ocupacion_actual: int = 0):
        super().__init__(fecha=fecha, boletos=boletos)
        self.sede = sede.strip().upper()
        self.ocupacion_actual = ocupacion_actual

    def validar_compra(self) -> None:
        self.validar_fecha()

        if self.sede not in self.CAPACIDADES:
            raise ValueError(f"Sede de museo inválida: {self.sede}.")

        if not (1 <= self.boletos <= self.MAX_BOLETOS):
            raise ValueError(f"Máximo {self.MAX_BOLETOS} boletos por usuario para museo.")

        capacidad_total = self.CAPACIDADES[self.sede]
        if self.ocupacion_actual + self.boletos > capacidad_total:
            raise ValueError(
                f"Capacidad excedida en {self.sede}. Quedan {capacidad_total - self.ocupacion_actual} lugares disponibles."
            )

    def calcular_total(self) -> float:
        return float(self.PRECIO_BOLETO * self.boletos)


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
