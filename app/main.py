import logging
import uuid

from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.routers import webhook

# --- Sentry (opcional: so ativa se SENTRY_DSN estiver configurado) ---
if settings.SENTRY_DSN:
    try:
        import sentry_sdk
        sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)
    except ImportError:
        pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s [%(request_id)s]: %(message)s",
    defaults={"request_id": "-"},
)

app = FastAPI(title="Mentor Empreendedor", version="1.0.0")


# --- Middleware: request ID em cada log ---
class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", uuid.uuid4().hex[:8])
        request.state.request_id = request_id
        return await call_next(request)


app.add_middleware(RequestIDMiddleware)
app.include_router(webhook.router)


@app.get("/health")
def health_check():
    """Health check basico — responde rapido para load balancers."""
    return {"status": "ok", "service": "Mentor Empreendedor"}


@app.get("/health/deep")
def deep_health_check():
    """Health check profundo — verifica conectividade com dependencias."""
    checks = {}

    # Supabase
    try:
        from app.services.supabase_service import _get_client
        client = _get_client()
        result = client.table("users").select("id").limit(1).execute()
        checks["supabase"] = "ok"
    except Exception as e:
        checks["supabase"] = f"error: {e}"

    # Claude API
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        client.messages.create(
            model=settings.CLAUDE_MODEL,
            max_tokens=10,
            messages=[{"role": "user", "content": "ping"}],
        )
        checks["claude"] = "ok"
    except Exception as e:
        checks["claude"] = f"error: {e}"

    # Twilio
    try:
        from twilio.rest import Client
        twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        twilio_client.api.accounts(settings.TWILIO_ACCOUNT_SID).fetch()
        checks["twilio"] = "ok"
    except Exception as e:
        checks["twilio"] = f"error: {e}"

    all_ok = all(v == "ok" for v in checks.values())
    return {
        "status": "ok" if all_ok else "degraded",
        "service": "Mentor Empreendedor",
        "checks": checks,
    }
