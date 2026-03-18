from typing import Optional
from twilio.rest import Client
from app.config import settings

_client: Optional[Client] = None


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    return _client


def send_whatsapp_message(to: str, body: str) -> str:
    """Envia mensagem via WhatsApp pelo Twilio. Retorna o SID da mensagem."""
    client = _get_client()

    # Twilio tem limite de 1600 chars por mensagem WhatsApp
    # Divide em partes se necessario
    max_len = 1500
    parts = [body[i : i + max_len] for i in range(0, len(body), max_len)]

    sid = ""
    for part in parts:
        message = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            body=part,
            to=to,
        )
        sid = message.sid

    return sid
