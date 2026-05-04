from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import find_dotenv, load_dotenv

from app.api.endpoints import router
from app.core.ticketmaster_api import ticketmaster_api

load_dotenv(find_dotenv())

app = FastAPI(
    title="TicketMaster Backend",
    description="API de venta de boletos para teatro, cine y museo usando FastAPI y POO.",
    version="1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("shutdown")
async def shutdown_event():
    await ticketmaster_api.close()
