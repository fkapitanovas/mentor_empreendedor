# Lessons Learned

## 2026-03-18: Python 3.9 nao suporta X | None
- Sintaxe `dict | None` e do Python 3.10+. Usar `Optional[dict]` do `typing` para compatibilidade com 3.9.

## 2026-03-18: FastAPI Form data requer python-multipart
- Se o endpoint usa `Form(...)`, o pacote `python-multipart` precisa estar instalado. Adicionar ao requirements.txt.

## 2026-03-18: Twilio envia telefone com prefixo whatsapp:
- O formato e `whatsapp:+5511999999999` (~28 chars). Campo `phone` no banco precisa de VARCHAR(50), nao VARCHAR(20).
