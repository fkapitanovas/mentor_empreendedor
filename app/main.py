import logging
from fastapi import FastAPI
from app.routers import webhook

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

app = FastAPI(title="Mentor Empreendedor", version="1.0.0")
app.include_router(webhook.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Mentor Empreendedor"}
