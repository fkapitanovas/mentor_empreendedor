import logging
from fastapi import APIRouter, Form, Response
from app.services import supabase_service, mentor, twilio_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhook")
async def whatsapp_webhook(
    From: str = Form(...),
    Body: str = Form(...),
) -> Response:
    """Recebe mensagem do Twilio WhatsApp e responde."""
    phone = From  # formato: whatsapp:+5511999999999
    message = Body.strip()

    logger.info("Mensagem recebida de %s: %s", phone, message[:50])

    try:
        # 1. Identifica/cria usuario
        user = supabase_service.get_or_create_user(phone)
        user_id = user["id"]

        # 2. Carrega historico
        history = supabase_service.get_conversation_history(user_id)

        # 3. Gera resposta do mentor
        response_text, profile_data = mentor.get_mentor_response(
            user, message, history
        )

        # 4. Se extraiu perfil, atualiza no banco
        if profile_data:
            supabase_service.update_user_profile(phone, profile_data)
            logger.info("Perfil atualizado para %s: %s", phone, profile_data)

        # 5. Salva mensagens no historico
        supabase_service.save_message(user_id, "user", message)
        supabase_service.save_message(user_id, "assistant", response_text)

        # 6. Envia resposta via WhatsApp
        twilio_service.send_whatsapp_message(phone, response_text)

    except Exception:
        logger.exception("Erro ao processar mensagem de %s", phone)
        twilio_service.send_whatsapp_message(
            phone,
            "Desculpe, tive um probleminha tecnico. Pode tentar de novo em alguns segundos? 🙏",
        )

    # Twilio espera 200 OK com corpo vazio (nao usar TwiML aqui)
    return Response(status_code=200)
