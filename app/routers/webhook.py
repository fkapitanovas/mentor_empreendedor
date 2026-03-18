import logging
import threading
import time
import uuid
from typing import Dict

from fastapi import APIRouter, Form, Request, Response
from app.services import supabase_service, mentor, twilio_service

logger = logging.getLogger(__name__)
router = APIRouter()

SUMMARY_TRIGGER_INTERVAL = 20
_RESET_COMMANDS = {"recomecar", "recomeçar", "resetar", "comecar de novo", "começar de novo"}

# --- Idempotency: track recently processed MessageSids ---
_seen_sids: Dict[str, float] = {}
_seen_sids_lock = threading.Lock()
_SEEN_SIDS_TTL = 300  # 5 minutes
_SEEN_SIDS_MAX = 5000


def _is_duplicate(message_sid: str) -> bool:
    """Return True if this MessageSid was already processed recently."""
    now = time.monotonic()
    with _seen_sids_lock:
        if len(_seen_sids) > _SEEN_SIDS_MAX:
            cutoff = now - _SEEN_SIDS_TTL
            expired = [k for k, v in _seen_sids.items() if v < cutoff]
            for k in expired:
                del _seen_sids[k]
        if message_sid in _seen_sids:
            return True
        _seen_sids[message_sid] = now
        return False


# --- Rate limiting: per-phone ---
_rate_tracker: Dict[str, list] = {}
_rate_lock = threading.Lock()
_RATE_LIMIT_MAX = 10
_RATE_LIMIT_WINDOW = 60  # seconds


def _is_rate_limited(phone: str) -> bool:
    """Return True if phone has exceeded 10 messages in 60 seconds."""
    now = time.monotonic()
    cutoff = now - _RATE_LIMIT_WINDOW
    with _rate_lock:
        timestamps = _rate_tracker.get(phone, [])
        timestamps = [t for t in timestamps if t > cutoff]
        if len(timestamps) >= _RATE_LIMIT_MAX:
            _rate_tracker[phone] = timestamps
            return True
        timestamps.append(now)
        _rate_tracker[phone] = timestamps
        return False


@router.post("/webhook")
def whatsapp_webhook(
    request: Request,
    From: str = Form(...),
    Body: str = Form(...),
    MessageSid: str = Form(""),
) -> Response:
    """Recebe mensagem do Twilio WhatsApp e responde."""
    phone = From
    message = Body.strip()
    req_id = getattr(request.state, "request_id", uuid.uuid4().hex[:8])

    logger.info("Mensagem recebida de %s: %s", phone, message[:50],
                extra={"request_id": req_id})

    if MessageSid and _is_duplicate(MessageSid):
        logger.info("Duplicate MessageSid %s, skipping", MessageSid,
                     extra={"request_id": req_id})
        return Response(status_code=200)

    if _is_rate_limited(phone):
        logger.warning("Rate limit exceeded for %s", phone,
                        extra={"request_id": req_id})
        twilio_service.send_whatsapp_message(
            phone,
            "Calma, estou processando suas mensagens! Aguarde um minutinho antes de enviar mais.",
        )
        return Response(status_code=200)

    try:
        # Comando de reset: recomecar onboarding
        if message.lower().strip() in _RESET_COMMANDS:
            supabase_service.reset_user_profile(phone)
            twilio_service.send_whatsapp_message(
                phone,
                "Pronto! Seu perfil foi resetado. Vamos comecar de novo — me conta, qual e o seu nome e o que voce faz?",
            )
            logger.info("Perfil resetado para %s", phone,
                        extra={"request_id": req_id})
            return Response(status_code=200)

        # 1. Identifica/cria usuario
        user = supabase_service.get_or_create_user(phone)
        user_id = user["id"]

        # 2. Carrega historico (100 msgs)
        history = supabase_service.get_conversation_history(user_id)

        # 3. Carrega resumo existente
        summary_record = supabase_service.get_conversation_summary(user_id)
        summary_text = summary_record["summary"] if summary_record else None

        # 4. Gera resposta do mentor (com resumo no system prompt)
        response_text, profile_data = mentor.get_mentor_response(
            user, message, history, summary=summary_text
        )

        # 5. Se extraiu perfil (diagnostico ou atualizacao), atualiza no banco
        if profile_data:
            supabase_service.update_user_profile(phone, profile_data)
            logger.info("Perfil atualizado para %s: %s", phone, profile_data,
                        extra={"request_id": req_id})

        # 6. Salva mensagens no historico
        supabase_service.save_message(user_id, "user", message)
        supabase_service.save_message(user_id, "assistant", response_text)

        # 7. Envia resposta via WhatsApp
        twilio_service.send_whatsapp_message(phone, response_text)

        # 8. Gera resumo em background (nao bloqueia proxima request)
        threading.Thread(
            target=_maybe_generate_summary,
            args=(user_id, summary_record),
            daemon=True,
        ).start()

    except Exception:
        logger.exception("Erro ao processar mensagem de %s", phone,
                         extra={"request_id": req_id})
        twilio_service.send_whatsapp_message(
            phone,
            "Desculpe, tive um probleminha tecnico. Pode tentar de novo em alguns segundos?",
        )

    # Twilio espera 200 OK com corpo vazio (nao usar TwiML aqui)
    return Response(status_code=200)


def _maybe_generate_summary(user_id: str, summary_record: dict = None) -> None:
    """Gera resumo se houve 20+ novas mensagens desde o ultimo resumo."""
    try:
        msg_count = supabase_service.get_message_count(user_id)
        messages_covered = summary_record["messages_covered"] if summary_record else 0

        if msg_count - messages_covered < SUMMARY_TRIGGER_INTERVAL:
            return

        # Busca ate 200 mensagens para gerar resumo
        messages = supabase_service.get_conversation_history(user_id, limit=200)
        previous_summary = summary_record["summary"] if summary_record else None

        new_summary = mentor.generate_conversation_summary(
            previous_summary=previous_summary,
            messages=messages,
        )

        if new_summary:
            supabase_service.upsert_conversation_summary(
                user_id=user_id,
                summary=new_summary,
                messages_covered=msg_count,
            )
            logger.info(
                "Resumo gerado para user %s (%d msgs cobertas)", user_id, msg_count
            )
    except Exception:
        logger.exception("Erro ao gerar resumo para user %s", user_id)
