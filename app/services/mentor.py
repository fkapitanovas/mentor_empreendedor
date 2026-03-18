import json
import logging
import re
from typing import List, Optional, Tuple
import anthropic
from app.config import settings
from app.prompts.system_prompt import build_system_prompt

logger = logging.getLogger(__name__)

_client: Optional[anthropic.Anthropic] = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        _client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


def _parse_tempo_meses(texto: str) -> Optional[int]:
    """Converte texto de tempo de negocio para meses inteiros.

    Exemplos: '2 anos' -> 24, '6 meses' -> 6, '1 ano e meio' -> 18
    """
    if not texto:
        return None
    texto = texto.lower().strip()

    meses = 0
    found = False

    # Busca anos
    match_anos = re.search(r"(\d+)\s*anos?", texto)
    if match_anos:
        meses += int(match_anos.group(1)) * 12
        found = True

    # Busca meses
    match_meses = re.search(r"(\d+)\s*mes(?:es)?", texto)
    if match_meses:
        meses += int(match_meses.group(1))
        found = True

    # "meio" ou "1/2" adiciona 6 meses
    if "meio" in texto or "1/2" in texto:
        meses += 6
        found = True

    return meses if found else None


def _parse_faturamento(texto: str) -> Optional[int]:
    """Converte texto de faturamento para valor inteiro mensal.

    Exemplos: 'R$ 10.000/mes' -> 10000, '5mil' -> 5000, '15k' -> 15000
    """
    if not texto:
        return None
    texto = texto.lower().strip()

    # Remove prefixos monetarios e espacos
    texto = re.sub(r"r\$\s*", "", texto)
    texto = re.sub(r"/m[eê]s", "", texto)
    texto = re.sub(r"\s+", "", texto)

    # Tenta formato com 'mil' ou 'k'
    match_mil = re.search(r"([\d.,]+)\s*(?:mil|k)", texto)
    if match_mil:
        valor_str = match_mil.group(1).replace(".", "").replace(",", ".")
        try:
            return int(float(valor_str) * 1000)
        except ValueError:
            return None

    # Tenta formato numerico direto (ex: 10.000, 10000, 10.000,00)
    match_num = re.search(r"([\d.]+),(\d{2})$", texto)
    if match_num:
        valor_str = match_num.group(1).replace(".", "") + "." + match_num.group(2)
        try:
            return int(float(valor_str))
        except ValueError:
            return None

    match_num = re.search(r"([\d.]+)", texto)
    if match_num:
        valor_str = match_num.group(1).replace(".", "")
        try:
            valor = int(valor_str)
            return valor if valor > 0 else None
        except ValueError:
            return None

    return None


def _standardize_profile_fields(data: dict) -> dict:
    """Adiciona campos inteiros padronizados ao dict de perfil."""
    result = dict(data)

    # Parsear tempo_negocio -> tempo_negocio_meses
    if "tempo_negocio" in data and data["tempo_negocio"]:
        meses = _parse_tempo_meses(data["tempo_negocio"])
        if meses is not None:
            result["tempo_negocio_meses"] = meses

    # Parsear faturamento -> faturamento_mensal
    if "faturamento" in data and data["faturamento"]:
        valor = _parse_faturamento(data["faturamento"])
        if valor is not None:
            result["faturamento_mensal"] = valor

    # Se Claude ja enviou os campos inteiros diretamente, manter
    if "tempo_negocio_meses" in data and data["tempo_negocio_meses"] is not None:
        result["tempo_negocio_meses"] = data["tempo_negocio_meses"]
    if "faturamento_mensal" in data and data["faturamento_mensal"] is not None:
        result["faturamento_mensal"] = data["faturamento_mensal"]

    return result


def get_mentor_response(
    user: dict, message: str, history: List[dict],
    summary: Optional[str] = None
) -> Tuple[str, Optional[dict]]:
    """
    Gera resposta do mentor via Claude API.

    Retorna (resposta_texto, perfil_extraido_ou_none).
    """
    client = _get_client()
    system_prompt = build_system_prompt(user, summary=summary)

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

    # Extrai perfil de diagnostico (onboarding) ou atualizacao dinamica
    profile_data = _extract_profile(full_text)
    profile_update = _extract_profile_update(full_text)

    # Mescla: atualizacao sobrescreve diagnostico se ambos presentes
    merged_profile = None
    if profile_data or profile_update:
        merged_profile = {}
        if profile_data:
            merged_profile.update(profile_data)
        if profile_update:
            merged_profile.update(profile_update)
        # Padroniza campos (parsing de texto -> inteiros)
        merged_profile = _standardize_profile_fields(merged_profile)

    # Remove tags de perfil do texto visivel ao usuario
    clean_text = re.sub(
        r"\[PERFIL_EXTRAIDO\].*?\[/PERFIL_EXTRAIDO\]",
        "",
        full_text,
        flags=re.DOTALL,
    )
    clean_text = re.sub(
        r"\[PERFIL_ATUALIZADO\].*?\[/PERFIL_ATUALIZADO\]",
        "",
        clean_text,
        flags=re.DOTALL,
    ).strip()

    return clean_text, merged_profile


def _extract_profile(text: str) -> Optional[dict]:
    """Extrai dados de perfil da tag [PERFIL_EXTRAIDO] na resposta do Claude."""
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


def _extract_profile_update(text: str) -> Optional[dict]:
    """Extrai dados de atualizacao da tag [PERFIL_ATUALIZADO] na resposta do Claude."""
    match = re.search(
        r"\[PERFIL_ATUALIZADO\](.*?)\[/PERFIL_ATUALIZADO\]", text, re.DOTALL
    )
    if not match:
        return None

    try:
        data = json.loads(match.group(1))
        return {k: v for k, v in data.items() if v is not None}
    except (json.JSONDecodeError, AttributeError):
        return None


def generate_conversation_summary(
    previous_summary: Optional[str],
    messages: List[dict],
) -> Optional[str]:
    """Gera resumo estruturado da conversa via Claude API.

    Recebe resumo anterior (se existir) + mensagens recentes.
    Retorna resumo de ate 800 palavras com 5 secoes.
    """
    client = _get_client()

    system = """Voce e um assistente que gera resumos estruturados de conversas entre \
um mentor de empreendedorismo e um microempreendedor brasileiro.

Gere um resumo com EXATAMENTE estas 5 secoes (maximo 800 palavras total):

1. TOPICOS DISCUTIDOS: Principais temas abordados nas conversas.
2. DECISOES TOMADAS: Decisoes que o empreendedor tomou ou comunicou.
3. CONSELHOS DADOS: Principais orientacoes e recomendacoes feitas pelo mentor.
4. PROGRESSO DO EMPREENDEDOR: Evolucao observada, metas alcancadas, mudancas.
5. PENDENCIAS E PROXIMOS PASSOS: Tarefas mencionadas mas nao concluidas, compromissos.

Seja objetivo e factual. Foque no que e util para dar continuidade ao acompanhamento."""

    content_parts = []
    if previous_summary:
        content_parts.append(
            f"RESUMO ANTERIOR (comprime conversas mais antigas):\n{previous_summary}\n\n---\n\n"
        )
    content_parts.append("MENSAGENS RECENTES:\n")
    for m in messages:
        role_label = "Empreendedor" if m["role"] == "user" else "Mentor"
        content_parts.append(f"{role_label}: {m['content']}\n")

    try:
        response = client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=1500,
            system=system,
            messages=[{"role": "user", "content": "".join(content_parts)}],
        )
        return response.content[0].text
    except Exception:
        logger.exception("Erro ao gerar resumo de conversa")
        return None
