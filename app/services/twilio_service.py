from typing import List, Optional
from twilio.rest import Client
from app.config import settings

_client: Optional[Client] = None


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    return _client


def _split_message(body: str, max_len: int = 1500) -> List[str]:
    """Divide mensagem em partes respeitando limites de palavra."""
    if len(body) <= max_len:
        return [body]

    parts = []
    while body:
        if len(body) <= max_len:
            parts.append(body)
            break

        # Procura ultimo espaco ou quebra de linha antes do limite
        cut = body.rfind("\n", 0, max_len)
        if cut == -1 or cut < max_len // 2:
            cut = body.rfind(" ", 0, max_len)
        if cut == -1 or cut < max_len // 2:
            cut = max_len  # fallback: corta no limite

        parts.append(body[:cut].rstrip())
        body = body[cut:].lstrip()

    return parts


def send_whatsapp_message(to: str, body: str) -> str:
    """Envia mensagem via WhatsApp pelo Twilio. Retorna o SID da mensagem."""
    client = _get_client()

    parts = _split_message(body)

    sid = ""
    for part in parts:
        message = client.messages.create(
            from_=settings.TWILIO_WHATSAPP_FROM,
            body=part,
            to=to,
        )
        sid = message.sid

    return sid
