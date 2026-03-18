from typing import List, Optional
from supabase import create_client, Client
from app.config import settings

_client: Optional[Client] = None


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    return _client


def get_or_create_user(phone: str) -> dict:
    """Busca usuario pelo telefone ou cria um novo."""
    client = _get_client()
    result = client.table("users").select("*").eq("phone", phone).execute()

    if result.data:
        return result.data[0]

    new_user = client.table("users").insert({"phone": phone}).execute()
    return new_user.data[0]


def update_user_profile(phone: str, data: dict) -> dict:
    """Atualiza perfil do usuario apos diagnostico."""
    client = _get_client()
    clean = {k: v for k, v in data.items() if v is not None}
    if clean:
        result = (
            client.table("users")
            .update({**clean, "is_onboarded": True})
            .eq("phone", phone)
            .execute()
        )
        return result.data[0]
    return get_or_create_user(phone)


def save_message(user_id: str, role: str, content: str) -> None:
    """Salva mensagem no historico."""
    client = _get_client()
    client.table("messages").insert(
        {"user_id": user_id, "role": role, "content": content}
    ).execute()


def get_conversation_history(user_id: str, limit: int = 50) -> List[dict]:
    """Retorna as ultimas N mensagens do usuario, em ordem cronologica."""
    client = _get_client()
    # Busca as mais recentes primeiro (desc), depois inverte para ordem cronologica
    result = (
        client.table("messages")
        .select("role, content")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return list(reversed(result.data))
