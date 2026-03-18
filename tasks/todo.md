# Mentor Empreendedor - Tarefas

## Etapa 1: Setup do Projeto ✅
- [x] Criar estrutura de pastas
- [x] requirements.txt
- [x] .env.example
- [x] .gitignore
- [x] Inicializar git repo

## Etapa 2: Supabase ✅
- [x] Criar projeto no supabase.com
- [x] Executar schema.sql no SQL Editor do Supabase
- [x] Pegar Project URL + anon key
- [x] Criar .env com credenciais do Supabase
- [x] Fix: ALTER phone VARCHAR(20) -> VARCHAR(50) (formato Twilio: whatsapp:+55...)

## Etapa 3: Codigo ✅
- [x] System prompt modular (5 blocos + referencias nichadas + diagnostico)
- [x] Config, Supabase service, Mentor service, Twilio service
- [x] Webhook router (POST /webhook), FastAPI main (GET /health)
- [x] Pydantic schemas
- [x] Fix: typing Optional[] para compatibilidade Python 3.9
- [x] Fix: python-multipart para Form data do Twilio

## Etapa 4: Credenciais ✅
- [x] ANTHROPIC_API_KEY
- [x] TWILIO_ACCOUNT_SID
- [x] TWILIO_AUTH_TOKEN

## Etapa 5: Teste ✅
- [x] pip install -r requirements.txt
- [x] Rodar uvicorn localmente
- [x] Instalar e configurar ngrok
- [x] Configurar URL do webhook no Twilio sandbox
- [x] Testar fluxo completo via WhatsApp — FUNCIONANDO

## Etapa 6: Enriquecimento da Base de Conhecimento ✅
- [x] Extrair lista de 22 livros do agente_microempreendedor (1).docx
- [x] Criar resumos executivos dos 22 livros (conceitos acionaveis por tema)
- [x] Integrar BASE_LIVROS como novo bloco no system prompt
- [x] Pesquisar perfil do Thiago Oliveira (Instagram, artigos, livros)
- [x] Atualizar BASE_CONHECIMENTO com trajetoria completa do Thiago Oliveira
- [x] Enriquecer resumos dos livros Pense Dentro da Caixa e Gestao Agil

## Etapa 7: Enriquecimento de Perfis de Gurus ✅
- [x] Perfil expandido Flavio Augusto (trilogia Geracao de Valor + pesquisa web)

## Etapa 8: Dominio Fixo para Webhook ✅
- [x] Configurar dominio estatico gratuito do ngrok
- [x] Dominio: toylike-chelsey-esophageal.ngrok-free.dev

## Etapa 9: Deploy em Producao (Railway) ✅
- [x] Criar Procfile, runtime.txt
- [x] Push para GitHub, conectar Railway, configurar env vars
- [x] Dominio: faithful-intuition-production-82bb.up.railway.app
- [x] Testar fluxo completo via WhatsApp em producao

## Etapa 10: Perfil Dinamico e Memoria ✅
- [x] Contexto de 100 mensagens (limit 50 → 100)
- [x] Campos padronizados para analytics (tempo_negocio_meses, faturamento_mensal)
- [x] Parsing automatico de texto livre para inteiros
- [x] Atualizacao dinamica de perfil via tag [PERFIL_ATUALIZADO]
- [x] Resumos de conversa a cada 20 mensagens (5 secoes estruturadas)
- [x] Resumos injetados no system prompt para memoria de longo prazo
- [x] Migracoes SQL executadas no Supabase

---

## Etapa 11: Robustez e Otimizacao ✅

### P0 — Bugs e Seguranca
- [x] 1. Fix `async def` → `def` no webhook (bloqueia event loop)
- [x] 3. Protecao contra mensagens duplicadas (idempotencia via MessageSid)

### P1 — Alto Impacto (custo e confiabilidade)
- [x] 4. Prompt caching da Anthropic (reduzir custo de API em 50-80%)
- [x] 5. Geração de resumo em background (não bloquear event loop)
- [x] 6. Aumentar max_tokens de 1024 para 2048
- [x] 7. Rate limiting por telefone (~10 msgs/minuto)

### P2 — Impacto Medio (qualidade e observabilidade)
- [x] 8. Testes unitarios (47 testes: parsing, split, idempotencia, rate limit)
- [x] 9. Smart message split (respeitar limites de palavra/newline)
- [x] 10. Deep health check (GET /health/deep — verifica Supabase, Claude, Twilio)
- [x] 11. Backfill de campos inteiros (script: python -m scripts.backfill_standardized_fields)
- [x] 12. Fix import fora de lugar em system_prompt.py

### P3 — Nice to Have (polish)
- [x] 13. Comando "recomecar" para resetar perfil (aceita: recomecar, resetar, comecar de novo)
- [x] 15. Logging com request ID (middleware RequestIDMiddleware + extra em todos os logs)
- [x] 16. Error tracking (Sentry — opcional via SENTRY_DSN env var)
- N/A: 14. Typing indicator — Twilio nao suporta para WhatsApp

---

## Pendente

- [ ] **Validacao de assinatura Twilio (X-Twilio-Signature)** — segurança: qualquer request ao /webhook é aceita sem verificar origem. Implementar com `twilio.request_validator.RequestValidator`. Requer URL publica do webhook como parametro.
- [ ] **Ativar Sentry no Railway** — criar conta em sentry.io, criar projeto Python/FastAPI, copiar DSN e adicionar env var `SENTRY_DSN` no dashboard do Railway. Codigo ja integrado (app/main.py), so precisa da variavel.
- [x] **Rodar backfill de campos inteiros** — 2/3 usuarios atualizados (2026-03-18)

---

## Proximas melhorias (backlog)
- [ ] Sair do Twilio Sandbox → WhatsApp Business API (numero proprio)
- [ ] Backup do Supabase (dados de usuarios e historico)
- [ ] Monitoramento e alertas (notificacao se bot cair)

## Status
- **MVP funcional e testado via WhatsApp**
- **System prompt: ~66k caracteres (10 blocos + 2 dinamicos)**
- **Deploy: Railway (producao, always-on)**
- **URL: https://faithful-intuition-production-82bb.up.railway.app**

## Conteudo do System Prompt (blocos)
1. Identidade e Tom (469 chars)
2. Base de Conhecimento por Tema (35.841 chars)
3. Base de Livros (9.150 chars)
4. Regras de Interacao (1.172 chars)
5. Personalizacao por Estagio (509 chars)
6. Resolucao de Conflitos (1.131 chars)
7. Referencias Nichadas por Setor (7.291 chars)
8. Base Institucional (6.594 chars)
9. Base Impulso Stone (3.211 chars)
10. Instrucoes de Diagnostico/Atualizacao (dinamico)
+ Contexto do Usuario (pos-onboarding)
+ Historico Resumido (quando existir)
