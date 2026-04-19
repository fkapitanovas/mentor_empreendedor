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

## Etapa 12: Migração para Web App (Next.js/Vercel) ✅ (2026-04-19)

### Motivação
Twilio se mostrou caro e com experiência ruim. Migração para web app responsivo.

### Decisões de Design
- Chat minimalista (estilo Claude.ai), streaming SSE, múltiplas conversas
- Light + Dark mode, onboarding opcional (formulário ou captura orgânica pela IA)
- Email + senha (Supabase Auth), deploy Vercel

### Implementação (10 commits, 5 batches)
- [x] **Batch 1 — Foundation**: Scaffold Next.js 16 + Tailwind v4 + shadcn/ui (16 componentes), Supabase Auth + middleware + login/register, migration SQL (conversations, email, skipped_onboarding) + tipos TS
- [x] **Batch 2 — Core Logic**: System prompt portado (11 blocos, ~66KB idênticos ao Python), profile extractor + summary generator portados
- [x] **Batch 3 — APIs**: Chat API com streaming SSE (Claude → ReadableStream), CRUD conversas, geração automática de título (Haiku), summary trigger a cada 20 msgs
- [x] **Batch 4 — Frontend**: Hooks useChat (streaming) + useConversations, componentes de chat (bubble, streaming, input, list), sidebar de conversas, layout desktop/mobile (Sheet), ThemeProvider + toggle
- [x] **Batch 5 — Features**: Onboarding opcional (5 campos, preencher ou pular), perfil editável, settings (tema, senha, excluir conta), signout server-side

### Build
- 13 rotas (7 estáticas + 6 dinâmicas), zero TypeScript errors
- Código em `web/` (Python original preservado intacto)

### Specs e Planos
- Spec: `docs/superpowers/specs/2026-04-19-migracao-web-app-design.md`
- Plano: `docs/superpowers/plans/2026-04-19-migracao-web-app.md`

---

## Pendente — Web App

- [ ] **Deploy Vercel** — criar projeto, configurar env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY), deploy `web/`
- [ ] **Configurar domínio** — decidir domínio e apontar DNS
- [ ] **Testar fluxo completo em produção** — registro → onboarding → chat streaming → perfil → dark mode → logout
- [ ] **RLS policies em messages/users** — verificar que RLS está habilitado e políticas cobrem o web app (auth.uid vs user_id)
- [ ] **Criar usuário no Supabase Auth** — verificar que o trigger de criação de profile (users) funciona com Supabase Auth

## Pendente — Chatbot WhatsApp (legado)

- [ ] Validação de assinatura Twilio (X-Twilio-Signature) — deprioritizado com migração web
- [ ] Ativar Sentry no Railway — deprioritizado com migração web
- [x] Rodar backfill de campos inteiros — 2/3 usuários atualizados (2026-03-18)

---

## Backlog (futuro)

- [ ] PWA instalável (manifest + service worker)
- [ ] Notificações push/email
- [ ] Catálogo de artigos para empreendedores
- [ ] Admin dashboard com métricas
- [ ] Exportação de dados (LGPD)
- [ ] Backup do Supabase (dados de usuários e histórico)
- [ ] Monitoramento e alertas (notificação se bot cair)
- [ ] Considerar reativar WhatsApp via WhatsApp Business API como canal adicional

## Status
- **Web app completo em `web/` (Next.js 16 + React 19 + Tailwind v4 + shadcn/ui)**
- **Chatbot WhatsApp em `app/` (Python/FastAPI) — funcional mas deprioritizado**
- **System prompt: ~66k caracteres (10 blocos + 2 dinâmicos) — portado para TS**
- **Aguardando deploy Vercel + configuração de env vars**

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
