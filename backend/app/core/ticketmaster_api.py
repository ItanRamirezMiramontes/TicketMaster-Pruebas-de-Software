import logging
import os
import httpx
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parents[2] / ".env"
if env_path.exists():
    load_dotenv(env_path)
else:
    load_dotenv()

logger = logging.getLogger(__name__)

class TicketmasterAPI:
    SAMPLE_EVENTS: List[Dict[str, Any]] = [
        {
            "id": "MUSICA1",
            "name": "Concierto Rock en Vivo",
            "url": "https://ticketmaster.example/concierto-rock",
            "dates": {"start": {"dateTime": "2026-06-12T21:00:00Z"}},
            "classifications": [{"segment": {"name": "Music"}}],
            "_embedded": {"venues": [{"name": "Arena Rock Palace", "city": {"name": "Ciudad Capital"}}]},
            "images": [{"url": "https://placehold.co/600x400?text=Rock+Concert"}],
            "priceRanges": [{"min": 150.0, "max": 320.0}],
        },
        {
            "id": "MUSICA2",
            "name": "Festival Electrónico Nocturno",
            "url": "https://ticketmaster.example/festival-electronico",
            "dates": {"start": {"dateTime": "2026-07-22T20:30:00Z"}},
            "classifications": [{"segment": {"name": "Music"}}],
            "_embedded": {"venues": [{"name": "Estadio Electrónico", "city": {"name": "Costa del Sol"}}]},
            "images": [{"url": "https://placehold.co/600x400?text=Electric+Festival"}],
            "priceRanges": [{"min": 180.0, "max": 410.0}],
        },
        {
            "id": "TEATRO1",
            "name": "Gran Comedia Musical",
            "url": "https://ticketmaster.example/comedia-musical",
            "dates": {"start": {"dateTime": "2026-06-25T19:00:00Z"}},
            "classifications": [{"segment": {"name": "Arts & Theatre"}}],
            "_embedded": {"venues": [{"name": "Teatro Royal", "city": {"name": "Ciudad Capital"}}]},
            "images": [{"url": "https://placehold.co/600x400?text=Musical+Show"}],
            "priceRanges": [{"min": 120.0, "max": 250.0}],
        },
        {
            "id": "CINE1",
            "name": "Estreno Blockbuster",
            "url": "https://ticketmaster.example/estreno-blockbuster",
            "dates": {"start": {"dateTime": "2026-06-17T18:00:00Z"}},
            "classifications": [{"segment": {"name": "Film"}}],
            "_embedded": {"venues": [{"name": "Cine IMAX", "city": {"name": "Ciudad Capital"}}]},
            "images": [{"url": "https://placehold.co/600x400?text=Movie+Premiere"}],
            "priceRanges": [{"min": 90.0, "max": 150.0}],
        },
    ]

    SAMPLE_VENUES: List[Dict[str, Any]] = [
        {
            "id": "MUSEO1",
            "name": "Museo de Ciencias",
            "type": "Museum",
            "url": "https://ticketmaster.example/museo-ciencias",
            "locale": "es-ES",
            "timezone": "Europe/Madrid",
            "city": {"name": "Ciudad Capital"},
            "country": {"name": "España", "countryCode": "ES"},
            "address": {"line1": "Avenida de la Ciencia 123"},
            "location": {"longitude": "-3.703790", "latitude": "40.416775"},
        },
        {
            "id": "MUSEO2",
            "name": "Museo de Arte Moderno",
            "type": "Museum",
            "url": "https://ticketmaster.example/museo-arte",
            "locale": "es-ES",
            "timezone": "Europe/Madrid",
            "city": {"name": "Costa del Sol"},
            "country": {"name": "España", "countryCode": "ES"},
            "address": {"line1": "Plaza del Arte 12"},
            "location": {"longitude": "-3.687000", "latitude": "40.423000"},
        },
    ]

    def __init__(self):
        self.api_key = os.getenv("TICKETMASTER_API_KEY")
        self.base_url = os.getenv("TICKETMASTER_BASE_URL", "https://app.ticketmaster.com/discovery/v2/")
        self.use_sample_data = not self.api_key or self.api_key == "your_api_key_here"

    def _filter_sample_events(self, classification_name: str | None, city: str | None) -> List[Dict[str, Any]]:
        events = [
            event
            for event in self.SAMPLE_EVENTS
            if classification_name is None
            or classification_name.lower() in event["classifications"][0]["segment"]["name"].lower()
        ]
        if city:
            events = [
                event
                for event in events
                if city.lower() in event.get("_embedded", {}).get("venues", [])[0].get("city", {}).get("name", "").lower()
            ]
        return events

    def _sample_event_by_id(self, event_id: str) -> Optional[Dict[str, Any]]:
        return next((event for event in self.SAMPLE_EVENTS if event["id"] == event_id), None)

    def _filter_sample_venues(self, city: str | None) -> List[Dict[str, Any]]:
        venues = self.SAMPLE_VENUES
        if city:
            venues = [
                venue
                for venue in venues
                if city.lower() in venue.get("city", {}).get("name", "").lower()
            ]
        return venues

    def _sample_venue_by_id(self, venue_id: str) -> Optional[Dict[str, Any]]:
        return next((venue for venue in self.SAMPLE_VENUES if venue["id"] == venue_id), None)

    async def search_events(self, classification_name: str = None, city: str = None, size: int = 20) -> Dict[str, Any]:
        """Buscar eventos por clasificación y ciudad"""
        if self.use_sample_data:
            return {"_embedded": {"events": self._filter_sample_events(classification_name, city)[:size]}}

        params = {"apikey": self.api_key, "size": size}
        if classification_name:
            params["classificationName"] = classification_name
        if city:
            params["city"] = city

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}events.json", params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            logger.warning("Ticketmaster search_events failed, usando datos de muestra: %s", exc)
            return {"_embedded": {"events": self._filter_sample_events(classification_name, city)[:size]}}

    async def get_event_details(self, event_id: str) -> Dict[str, Any]:
        """Obtener detalles de un evento específico"""
        if self.use_sample_data:
            sample = self._sample_event_by_id(event_id)
            if sample:
                return sample
            raise ValueError("Evento no encontrado en datos de muestra.")

        params = {"apikey": self.api_key}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}events/{event_id}.json", params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            logger.warning("Ticketmaster get_event_details failed, usando muestra si está disponible: %s", exc)
            sample = self._sample_event_by_id(event_id)
            if sample:
                return sample
            raise

    async def get_venue_details(self, venue_id: str) -> Dict[str, Any]:
        """Obtener detalles de un venue específico"""
        if self.use_sample_data:
            sample = self._sample_venue_by_id(venue_id)
            if sample:
                return sample
            raise ValueError("Venue no encontrado en datos de muestra.")

        params = {"apikey": self.api_key}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}venues/{venue_id}.json", params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            logger.warning("Ticketmaster get_venue_details failed, usando muestra si está disponible: %s", exc)
            sample = self._sample_venue_by_id(venue_id)
            if sample:
                return sample
            raise

    async def get_venues(self, city: str = None, size: int = 20) -> Dict[str, Any]:
        """Buscar venues por ciudad"""
        if self.use_sample_data:
            return {"_embedded": {"venues": self._filter_sample_venues(city)[:size]}}

        params = {"apikey": self.api_key, "size": size}
        if city:
            params["city"] = city

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}venues.json", params=params)
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as exc:
            logger.warning("Ticketmaster get_venues failed, usando datos de muestra: %s", exc)
            return {"_embedded": {"venues": self._filter_sample_venues(city)[:size]}}

    async def close(self) -> None:
        """No-op close method kept for FastAPI shutdown compatibility."""
        return None

# Instancia global
ticketmaster_api = TicketmasterAPI()
