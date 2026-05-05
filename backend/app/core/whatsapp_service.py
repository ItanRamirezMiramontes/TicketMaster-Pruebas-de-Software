import logging
import os
import re

from dotenv import load_dotenv
from requests.exceptions import RequestException, Timeout
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

load_dotenv()

logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM")


def _normalize_whatsapp_number(phone: str) -> str | None:
    if not phone or not phone.strip():
        return None

    cleaned = re.sub(r"[^\d+]", "", phone)
    if cleaned.startswith("whatsapp:"):
        return cleaned

    digits = re.sub(r"\D", "", cleaned)
    if len(digits) == 10:
        return f"whatsapp:+52{digits}"
    if digits.startswith("52") and len(digits) == 12:
        return f"whatsapp:+{digits}"
    if digits.startswith("521") and len(digits) == 13:
        return f"whatsapp:+{digits}"

    return f"whatsapp:+{digits}" if digits else None


def _build_message(
    nombre: str,
    tipo_evento: str,
    ubicacion: str,
    fecha: str,
    cantidad: int,
    metodo_pago: str,
    total: float,
    codigo_confirmacion: str,
) -> str:
    return (
        "🎟️ *Confirmación de compra - TicketMaster*\n\n"
        f"👤 Cliente: {nombre}\n"
        f"🎭 Evento: {tipo_evento}\n"
        f"📍 Ubicación: {ubicacion}\n"
        f"📅 Fecha: {fecha}\n"
        f"🎫 Boletos: {cantidad}\n"
        f"💳 Método de pago: {metodo_pago}\n"
        f"💰 Total: ${total} MXN\n"
        f"✅ Código de confirmación: {codigo_confirmacion}\n\n"
        "¡Gracias por tu compra!"
    )


def enviar_whatsapp(
    telefono: str | None,
    nombre: str,
    tipo_evento: str,
    ubicacion: str,
    fecha: str,
    cantidad: int,
    metodo_pago: str,
    total: float,
    codigo_confirmacion: str,
) -> None:
    if not telefono:
        logger.info("No se envía WhatsApp porque no se proporcionó teléfono de usuario.")
        return

    if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM]):
        logger.error("No se configuraron correctamente las variables de entorno de Twilio.")
        return

    to_whatsapp = _normalize_whatsapp_number(telefono)
    if not to_whatsapp:
        logger.error("Número de teléfono inválido para WhatsApp: %s", telefono)
        return

    body = _build_message(
        nombre=nombre,
        tipo_evento=tipo_evento,
        ubicacion=ubicacion,
        fecha=fecha,
        cantidad=cantidad,
        metodo_pago=metodo_pago,
        total=total,
        codigo_confirmacion=codigo_confirmacion,
    )

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    try:
        client.messages.create(body=body, from_=TWILIO_WHATSAPP_FROM, to=to_whatsapp)
    except TwilioRestException as exc:
        logger.error("TwilioRestException enviando WhatsApp: %s", str(exc))
    except (RequestException, Timeout, OSError) as exc:
        logger.warning("Error de red enviando WhatsApp, se intentará una vez más: %s", str(exc))
        try:
            client.messages.create(body=body, from_=TWILIO_WHATSAPP_FROM, to=to_whatsapp)
        except Exception as retry_exc:
            logger.error("Reintento de WhatsApp falló: %s", str(retry_exc))
    except Exception as exc:
        logger.error("Error inesperado enviando WhatsApp: %s", str(exc))
