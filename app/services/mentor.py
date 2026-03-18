import json
import re
from typing import List, Optional, Tuple
import anthropic
from app.config import settings
from app.prompts.system_prompt import build_system_prompt

_client: Optional[anthropic.Anthropic] = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


def get_mentor_response(
    user: dict, message: str, history: List[dict]
) -> Tuple[str, Optional[dict]]:
    """
    Gera resposta do mentor via Claude API.

    Retorna (resposta_texto, perfil_extraido_ou_none).
    """
    client = _get_client()
    system_prompt = build_system_prompt(user)

    # Monta mensagens: historico + mensagem atual
    messages = [{"role": m["role"], "content": m["content"]} for m in history]
    messages.append({"role": "user", "content": message})

    response = client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )

    full_text = response.content[0].text

    # Extrai perfil se presente na resposta (diagnostico)
    profile_data = _extract_profile(full_text)

    # Remove a tag de perfil do texto visivel ao usuario
    clean_text = re.sub(
        r"\[PERFIL_EXTRAIDO\].*?\[/PERFIL_EXTRAIDO\]",
        "",
        full_text,
        flags=re.DOTALL,
    ).strip()

    return clean_text, profile_data


def _extract_profile(text: str) -> Optional[dict]:
    """Extrai dados de perfil da tag especial na resposta do Claude."""
    match = re.search(
        r"\[PERFIL_EXTRAIDO\](.*?)\[/PERFIL_EXTRAIDO\]", text, re.DOTALL
    )
    if not match:
        return None

    try:
        data = json.loads(match.group(1))
        return {k: v for k, v in data.items() if v is not None}
    except (json.JSONDecodeError, AttributeError):
        return None
