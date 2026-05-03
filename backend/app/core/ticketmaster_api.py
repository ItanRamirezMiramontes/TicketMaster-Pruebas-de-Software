import os
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class TicketmasterAPI:
    def __init__(self):
        self.api_key = os.getenv("TICKETMASTER_API_KEY")
        self.base_url = os.getenv("TICKETMASTER_BASE_URL", "https://app.ticketmaster.com/discovery/v2/")
        self.client = httpx.AsyncClient()

    async def search_events(self, classification_name: str = None, city: str = None, size: int = 20) -> Dict[str, Any]:
        """Buscar eventos por clasificación y ciudad"""
        params = {
            "apikey": self.api_key,
            "size": size
        }
        if classification_name:
            params["classificationName"] = classification_name
        if city:
            params["city"] = city

        response = await self.client.get(f"{self.base_url}events.json", params=params)
        response.raise_for_status()
        return response.json()

    async def get_event_details(self, event_id: str) -> Dict[str, Any]:
        """Obtener detalles de un evento específico"""
        params = {"apikey": self.api_key}
        response = await self.client.get(f"{self.base_url}events/{event_id}.json", params=params)
        response.raise_for_status()
        return response.json()

    async def get_venues(self, city: str = None, size: int = 20) -> Dict[str, Any]:
        """Buscar venues por ciudad"""
        params = {
            "apikey": self.api_key,
            "size": size
        }
        if city:
            params["city"] = city

        response = await self.client.get(f"{self.base_url}venues.json", params=params)
        response.raise_for_status()
        return response.json()

    async def close(self):
        await self.client.aclose()

# Instancia global
ticketmaster_api = TicketmasterAPI()