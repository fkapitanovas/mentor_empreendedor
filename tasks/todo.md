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

## Etapa 13: Auth Improvements ✅ (2026-04-19)

- [x] **Esqueci minha senha** — /forgot-password, email via Supabase `resetPasswordForEmail`, tela de sucesso
- [x] **Redefinir senha** — /reset-password, nova senha + confirmar, `updateUser({ password })`
- [x] **Confirmação de email** — após registro mostra "verifique seu email" em vez de redirecionar direto
- [x] **Auth callback** — /auth/callback troca code por session (email confirm + password reset)
- [x] **Toggle de senha** — Eye/EyeOff em todos os campos de senha (login, registro, redefinir)
- [x] **Middleware atualizado** — permite /forgot-password, /reset-password, /auth/callback

## Etapa 14: Bug Fixes Pós-Deploy ✅ (2026-04-19)

- [x] **phone NOT NULL** — relaxado para permitir users web sem telefone
- [x] **Trigger handle_new_user** — auto-cria perfil em public.users no signup do Supabase Auth
- [x] **RLS policies completas** — users (read/update own), messages (read/insert own), conversation_summaries (read/insert/update via conversation)
- [x] **cleanProfileTags()** — remove tags [PERFIL_EXTRAIDO] e [PERFIL_ATUALIZADO] do streaming e mensagem final no client

---

## Pendente — Web App

- [x] **Deploy Vercel** — projeto `web` criado, env vars configuradas, deploy production READY (2026-04-19)
  - URL original: https://web-theta-ashen-35.vercel.app
- [x] **Configurar domínio maximpulso.com.br no Vercel** — DNS A apontando para 76.76.21.21, SSL emitido, Supabase Site URL atualizado (2026-04-20)
- [ ] **Product Analytics (PostHog)** — instalar PostHog para rastrear uso, retenção e comportamento dos empreendedores:
  - Criar conta em posthog.com (plano gratuito: 1M eventos/mês)
  - Instalar `posthog-js` e `posthog-node`
  - Criar provider `PostHogProvider` no layout
  - Eventos a rastrear: registro, onboarding (preencheu/pulou), mensagem enviada, conversa criada, perfil editado, tema alterado
  - Session replay e heatmaps para entender UX
  - Funil: registro → onboarding → 1ª mensagem → 5ª mensagem → retorno D7
- [ ] **Testar emails via Resend** — domínio `maximpulso.com.br` verificado no Resend, SMTP configurado no Supabase, templates pt-BR prontos. Aguardando propagação DNS. Após propagar, testar: registro (email de confirmação) + esqueci senha (email de reset). Verificar entrega na caixa de entrada (não spam).
- [ ] **Testar fluxo completo em produção** — registro → email confirmação → onboarding → chat streaming → perfil → dark mode → esqueci senha → logout

## Pendente — Chatbot WhatsApp (legado)

- [ ] Validação de assinatura Twilio (X-Twilio-Signature) — deprioritizado com migração web
- [ ] Ativar Sentry no Railway — deprioritizado com migração web
- [x] Rodar backfill de campos inteiros — 2/3 usuários atualizados (2026-03-18)

---

## Pendente — Conteúdo do System Prompt

- [ ] **Nichos sub-representados** — Adicionar referências nichadas para setores com zero cobertura:
  - **Pet** (mercado que mais cresce no BR): influenciadores de pet shop, banho e tosa, adestramento, petiscos artesanais
  - **Alimentação geral** (além de confeitaria): marmitas fit, food trucks, açaí, espetinhos, salgados — referências de precificação e operação
  - **Serviços domésticos**: diaristas, reformas, jardinagem, eletricistas, encanadores — como precificar serviço por hora, captar clientes
  - **Artesanato**: crochê, bijuterias, velas artesanais, sabonetes — precificação de itens manuais, vendas em feiras e online
  - Pesquisar influenciadores/especialistas por nicho e criar perfis no formato do `nichos.ts`

## Backlog (futuro)

- [ ] PWA instalável (manifest + service worker)
- [ ] Notificações push/email
- [ ] Catálogo de artigos para empreendedores
- [ ] Admin dashboard com métricas
- [ ] Exportação de dados (LGPD)
- [ ] Backup do Supabase (dados de usuários e histórico)
- [ ] Monitoramento e alertas (notificação se bot cair)
- [ ] Considerar reativar WhatsApp via WhatsApp Business API como canal adicional

---

## Etapa 15: Auditoria UI/UX/Performance — 31 achados ✅ (2026-04-21)

Auditoria completa usando skill `ui-ux-pro-max`. 6 críticos, 8 altos, 10 médios, 7 de performance.

### Fundações (Grupo 1)
- [x] **#1 Viewport meta** — `export const viewport` com `themeColor` light/dark
- [x] **#2 Contraste muted-foreground** — `#78716C → #57534E` (ratio 5.5:1, passa AA)
- [x] **#4 prefers-reduced-motion** — `@media` global em globals.css
- [x] **#8 Gradient tokens** — `--gradient-brand`, `--gradient-brand-strong`, `--gradient-brand-text`
- [x] **#10 OG/Twitter metadata** — openGraph, twitter card, robots
- [x] **#15 Escala tipográfica** — `--text-xs..--text-6xl` canônica
- [x] **#16 Border dark mode** — `rgba(255,255,255,0.08)` → `0.12`
- [x] **#17 Radius scale** — shadcn pattern `calc(var(--radius) ± Npx)`
- [x] **#25 next.config** — `compress`, `poweredByHeader=false`, `optimizePackageImports`, images AVIF/WebP
- [x] **#31 PWA manifest** — `/manifest.webmanifest` + ícones 192/512/maskable via sharp script

### Chat UX (Grupo 2)
- [x] **#3 aria-live streaming** — `role="log"`, `aria-live="polite"`, `aria-busy` no MessageList; `role="status"` + sr-only no TypingIndicator/StreamingMessage
- [x] **#5 Stop-streaming** — `AbortController` em ref no `use-chat`, botão Square no chat-input quando isStreaming
- [x] **#6 Auto-scroll inteligente** — `shouldStickRef` via scroll listener no viewport base-ui; só faz scroll se <80px do fim
- [x] **#9 Retry inline** — state `error` + `lastUserMessage`, bloco com AlertCircle + botão "Tentar novamente"
- [x] **#11 MessageBubble memo** — `memo()` + comparator por id+content; `useMemo(formatContent)`
- [x] **#12 Scroll preservation** — sessionStorage `scroll-conv-{id}` por conversa, restaurado após loadMessages
- [x] **#28 Auto-scroll mobile** — debounced via shouldStick; evita layout thrash
- [x] **#29 formatContent memo** — cacheado via useMemo por content+role
- [x] **#30 TextDecoderStream** — `response.body.pipeThrough(new TextDecoderStream())` no use-chat

### A11Y shell (Grupo 3)
- [x] **#7 Delete confirmation** — AlertDialog shadcn com onConfirm
- [x] **#13 Landmarks + skip-link** — `role="banner"` no header, `role="navigation"` na aside, `role="main"` no main, skip-link `.skip-link` visible-on-focus
- [x] **#14 Focus-visible em botões custom** — eye-toggles, hamburger, dropdown triggers
- [x] **#18 Theme toggle icon** — Sun/Moon/Monitor dinâmico conforme `theme`, `mounted` pattern para hydration

### Forms (Grupo 4)
- [x] **#19 Suspense fallback login** — Skeleton Card com mesma estrutura do form
- [x] **#20 Password strength** — função `calculatePasswordStrength`, 5 barras coloridas com `aria-live`
- [x] **#21 Autosave onboarding** — sessionStorage `onboarding-draft` com debounce 400ms, restore via `restoredOnceRef`
- [x] **#22 Admin pagination** — server-side `?limit=50&offset=0&total=N`, botão "Carregar mais", busca local via useMemo

### Loading/Error (Grupo 5)
- [x] **#23 loading.tsx por rota** — root, (chat), (auth), admin
- [x] **#24 error.tsx por rota** — root, (chat), (auth) com reset button

### Bônus (imprevistos descobertos)
- [x] **Middleware matcher** — expandido para excluir `manifest.webmanifest|icon|apple-icon|opengraph-image|*.png|svg|...` (PWA assets deixaram de redirecionar para /login)

**Skip:** #26 Dynamic imports de admin/settings/profile — Next.js App Router já faz route-level splitting automaticamente.

Commit: `0debe65 feat(web): auditoria UI/UX/performance — 31 achados implementados`

---

## Etapa 16: Segunda auditoria — polimento final ✅ (2026-04-21)

Segunda passada revelou 6 achados emergentes. Implementados:

- [x] **#32 autoComplete** — `email`, `current-password`, `new-password` em login/register/forgot/reset
- [x] **#33 inputMode decimal** — faturamento do onboarding
- [x] **#34 Metadata individual** — 8 `layout.tsx` de rota com `title` específico (Entrar, Criar conta, Esqueci, Redefinir, Conte sobre seu negócio, Meu perfil, Configurações, Painel admin com robots noindex)
- [x] **#35 Toast QuotaExceededError** — onboarding mostra toast em vez de falhar silenciosamente
- [x] **#36 text-[15px] → text-base** — headings markdown do assistant bubble
- [x] **#26 AlertDialog lazy-load** — `DeleteConversationDialog` extraído + `next/dynamic` em conversation-item (ssr:false, loading:null). Bônus: refatorou Link e button para serem siblings (fim do AlertDialogTrigger dentro de Link frágil = #37)

Commit: `d6e2228 feat(web): segunda auditoria UI/UX — 6 achados polimento`

---

## Etapa 17: Redesign "Tropical Maximalista" — direção B ✅ (2026-04-21)

Terceira auditoria (via skill `frontend-design` — princípios do Claude) diagnosticou genericidade alta. Três direções foram mockadas em `/tmp/mentor-design-preview.html`:
- **A — Editorial Mentor** (Fraunces italic + olive/terracotta)
- **B — Tropical Maximalista** (Bricolage Grotesque + jungle/coral/sol) ✅ ESCOLHIDA
- **C — Stone Restraint** (IBM Plex Sans + preto/branco/verde Stone)

### Fundações (globals.css + layout root)
- [x] **Fontes** — Plus Jakarta Sans/DM Sans → Bricolage Grotesque (display variável) + IBM Plex Sans (body)
- [x] **Paleta** — jungle `#0F3E2A` / coral `#F87171` / sol `#FCD34D` / creme `#FFF8E7` + tokens `--ink --coral --sun --cream --jungle`
- [x] **Gradientes** — `--gradient-brand`, `--gradient-brand-strong`, `--gradient-brand-text`, `--gradient-tropical`
- [x] **Hard shadows** — `.shadow-hard-sm` (4px 4px 0 ink), `.shadow-hard` (6px), `.shadow-hard-lg` (10px)
- [x] **Gradient mesh** — `.tropical-mesh` com drift 24s animate
- [x] **Grain overlay** — `body::after` com SVG turbulence, blend overlay, opacity 55% light / 35% dark
- [x] **Wave animation** — `@keyframes wave` para emoji saudação
- [x] **themeColor atualizado** — light `#FFF8E7`, dark `#0A1A12`

### Auth (5 arquivos)
- [x] Gradient mesh no `(auth)/layout`; brand badge rotacionado `-2deg` com M amarela
- [x] Cards com `border: 3px ink` + `rounded-3xl` + `shadow-hard-lg`
- [x] Shapes decorativos: círculo coral `-top-3 -left-3` + quadrado sol `rotate-12 -bottom-4 right-6`
- [x] Títulos com "bora" / "Em 30 segundos." / "Calma." / "senha forte." em `bg-clip-text gradient coral→sol`
- [x] Inputs: `border: 2px ink`, focus translate `-0.5/-0.5` + shadow hard coral
- [x] CTAs: bg-primary text-sun → hover bg-accent text-cream + hard shadow + translate `-2px`
- [x] Password strength bars: coral / sol / emerald (tokens, não hardcoded)
- [x] Success states: círculo `bg-sun` bordered `border: 3px ink` + `shadow-hard-sm`

### Chat (7 componentes)
- [x] Header `(chat)/layout`: brand badge rotado, `border-b: 2px ink`
- [x] Sidebar: `border-r: 2px ink`; conversa ativa com `border-l: 4px coral`
- [x] Empty state MessageList: "Oi 👋🏽 Sou o Max." (heading Bricolage extrabold + wave animado + outline-stroke italic)
- [x] 4 chips de sugestão rotacionados (sun / coral / primary), stagger 80ms
- [x] MessageBubble: bordas 2px ink; assistant bg-card + avatar sol; user bg-coral text-cream
- [x] TypingIndicator: dots coral em bubble bordado + avatar sol
- [x] StreamingMessage: cursor piscante em coral
- [x] ChatInput: textarea bordada com focus coral-shadow; botão send circular (sol idle → coral quando stop-streaming)
- [x] ConversationList "Nova conversa": primary sólido, hover hard shadow + translate

### Internas (4 páginas)
- [x] Onboarding: tropical-mesh background + progress bar gradient coral→sol + card com shapes decorativos
- [x] Profile: card bordado 3px ink + badges de estágio tropicalizadas (sun/coral/primary)
- [x] Settings: 3 sections com shadow-hard; section de delete com border coral + shadow coral (perigo)
- [x] Admin: tabela bordada, header bg-muted bordered, monospace em metadata "X de Y carregados"
- [x] DeleteConversationDialog: `border: 3px ink` + `rounded-3xl` + `shadow-hard-lg`

Commit: `55af1a9 feat(web): redesign Tropical Maximalista — direção B aprovada` — 20 arquivos, +958/-591

---

## Etapa 18: Pós-redesign — ajustes finos e debug mobile ✅ (2026-04-21 tarde)

### Heading contextual no /login
- [x] Primeira visita (sem flag em localStorage): **"Bora empreender."** + "Entre na sua conta — ou crie uma agora."
- [x] Usuário retornando (após 1º login bem-sucedido): **"Volta aí, bora crescer."** + "Tudo certo — só entrar."
- [x] Flag `max-has-logged-in` setada após signInWithPassword bem-sucedido
- [x] Fallback: modo privado / localStorage indisponível → sempre mostra versão neutra ("Bora empreender.")

Commit: `619f5ad feat(login): heading contextual — "Bora empreender." na primeira vez`

### Atalhos de scroll no chat (↑↓ FABs)
- [x] Dois botões circulares no canto inferior direito, acima do ChatInput
- [x] Visíveis quando conversa tem **4+ mensagens** (presença simples, não depende de scroll tracking)
- [x] `scrollIntoView` em topRef + bottomRef (nativo do browser, não depende de detectar viewport do base-ui)
- [x] Linguagem Tropical: `rounded-full` + `border 2px ink` + `bg-card` → hover `bg-sun` + `shadow-hard-sm` + translate
- [x] A11Y: aria-label descritivos pt-BR, focus-visible ring accent, touch target 44px, active:scale-95
- [x] Position: `fixed` + inline style `calc(env(safe-area-inset-bottom, 0px) + 5rem)` para respeitar home indicator iOS

**Debug journey:** 5 iterações para funcionar no mobile (desktop funcionou de cara). Causa raiz: Tailwind v4 JIT escapa vírgulas dentro de `calc(env(...))` em arbitrary values de forma inconsistente, gerando CSS ignorado no mobile. Fix: inline `style={{ bottom: 'calc(...)' }}` + container `fixed inset-x-0 flex justify-end` + `z-[60]`. Lição salva em memory `feedback_tailwind_v4_calc_env.md`.

Commits: `5aadab6` → `1907a6f` → `5f259a9` → `90d235d` → `9f0a8dd`

### Limpeza Vercel
- [x] Projeto duplicado `mentor_empreendedor` (criado acidentalmente por deploys da raiz) removido 3x via `vercel remove`
- [x] `.vercelignore` adicionado na raiz (mitigação parcial — guard definitivo é sempre `cd web/` antes de `vercel --prod`)
- [x] Lição registrada em memory `feedback_vercel_deploy_dir.md`

Commit: `d1c2bbb chore: .vercelignore na raiz`

---

## Status (atualizado 2026-04-21 tarde)
- **Web app ativo em produção**: https://maximpulso.com.br (Vercel, SSL, DNS propagado)
- **Design "Tropical Maximalista"**: Bricolage Grotesque + IBM Plex Sans, paleta jungle/coral/sol/creme, hard shadows, gradient mesh, grain overlay
- **Acessibilidade**: WCAG AA completo (contraste, aria-live, landmarks, skip-link, reduced-motion, autoComplete/inputMode)
- **Performance**: Lighthouse build otimizado, optimizePackageImports, PWA instalável (manifest + icons), lazy AlertDialog
- **Admin**: `/admin` com tabela + export CSV + paginação server-side + busca local
- **Chat UX polido**: empty state Tropical, FABs de scroll (mobile+desktop), heading contextual de login
- **Chatbot WhatsApp em `app/` (Python/FastAPI) — funcional mas deprioritizado**
- **Repo GitHub**: https://github.com/fkapitanovas/mentor_empreendedor (main, 10+ commits pós-auditoria)

## Conteudo do System Prompt (14 blocos, v1.2 — 21/04/2026)
1. Identidade e Tom
2. Base de Conhecimento por Tema (13 gurus incl. Ana Fontes) — ~12.200 tokens
3. Base de Livros (23 livros, curadoria v1.2) — ~32.500 tokens
4. Regras de Interacao (10 regras obrigatorias)
5. Personalizacao por Estagio (iniciante / crescimento / consolidado)
6. Resolucao de Conflitos (9 tensoes entre gurus)
7. Referencias Nichadas por Setor (26 influenciadores)
8. Base Institucional (Sebrae + gov.br, valores 2026)
9. Base Impulso Stone (8 modulos do programa)
10. Formalizacao MEI (DAS 2026, obrigacoes, migracao ME)
11. E-commerce (marketplaces, logistica, vendas online)
12. Ferramentas Praticas (financeiro, CRM, design, pagamentos, IA)
13. Instrucoes de Diagnostico/Atualizacao (dinamico)
+ Contexto do Usuario (pos-onboarding)
+ Historico Resumido (quando existir)

**Total system prompt ~57.200 tokens (29% do context window do Sonnet 4.6).**

## Etapa 15: Curadoria da Base de Livros v1.2 ✅ (21/04/2026 tarde)
- [x] Migrar livro da Ana Fontes de conhecimento.ts para livros.ts (separacao perfil × obra)
- [x] **Remover 3 livros fora da realidade MEI BR**: De Zero a Um (Thiel), O Lado Dificil das Coisas Dificeis (Horowitz), Sonho Grande (Correa)
- [x] **Reduzir 3 livros a apenas conceitos universais**: Obsessao pelo Cliente (195→45), Empresas Feitas para Vencer (35→15), A Startup Enxuta (30→15)
- [x] Expandir 3 livros a partir de PDFs completos: Mindset (Dweck), Essencialismo (McKeown), Pai Rico Pai Pobre (Kiyosaki)
- [x] Criar PRD completo do projeto em `docs/PRD.md` (v1.2, ~600 linhas cobrindo matrizes, fontes, mecanismo de adequacao)
- [x] Gerar PDF do PRD em `~/Downloads/PRD-MaxImpulso.pdf` via Chrome headless + CSS Tropical (21 paginas)

**Resultado da v1.2:**
- Livros: 26 → 23 (foco na realidade MEI brasileiro)
- `livros.ts`: 118.809 → 106.595 chars (-10,3%) / ~36.200 → ~32.500 tokens
- Margem ate teto saudavel de 40k tokens: 10% → 19%
- Commits: `ddfef13` (migracao Ana Fontes), `1ff5ab4` (curadoria v1.2)

## Proximos passos prioritarios (pos-v1.2)
- [ ] Adicionar livros de gap identificado: **$100M Offers** (Hormozi — precificacao/oferta), **Nunca Divida a Diferenca** (Chris Voss — negociacao), **Radical Candor** (Kim Scott — primeira contratacao)
- [x] Observabilidade do prompt: logar qual livro/guru e citado por estagio/setor para iterar curadoria (Etapa 20 — 21/04/2026)
- [ ] PostHog analytics (retencao, funil de conversao)
- [ ] Nichos sub-representados (pet, alimentacao geral, servicos domesticos, artesanato)
- [ ] Service Worker opcional (PWA fase 2 offline)
- [ ] Gaps de conteudo: juridico/compliance, saude mental/burnout, metricas CAC/LTV

---

## Etapa 19: Brand + Favicon/PWA/OG + Integração Sebrae ✅ (2026-04-21 noite)

### Brand Max Impulso — foguete colorido aplicado em todos os ativos
- [x] Copiar 4 SVGs fonte (color / dark / white / horizontal) + preview HTML para `web/public/brand/`
- [x] Reescrever `icon.tsx` (32×32) e `apple-icon.tsx` (180×180) renderizando SVG inline via ImageResponse (satori)
- [x] Redesenhar `opengraph-image.tsx` (1200×630): card com foguete + wordmark "MAX IMPULSO" + headline "Seu mentor de negócios, a qualquer hora." + pílula laranja `maximpulso.com.br`
- [x] Regenerar `public/icon-192.png`, `icon-512.png` (foguete em tile creme arredondado) e `icon-maskable-512.png` (foguete branco sobre laranja `#FF6B35`, safe area 60%)
- [x] Gerar `src/app/favicon.ico` multi-size (16/32/48) com PNGs embutidos via wrapper ICO manual
- [x] Atualizar `manifest.webmanifest`: theme_color `#FF6B35` (Impulso), background_color `#FAFAF9`
- [x] Estender `scripts/generate-pwa-icons.mjs` para ler `brand/max-impulso-icon-color.svg` e também produzir favicon.ico
- [x] Deploy produção — verificação visual OK: OG com wordmark bem formado, apple-icon com foguete colorido, favicon pequeno mas reconhecível

Commit: `e1eb754` feat(brand): aplicar logo Max Impulso em favicon, PWA e OG

### Integração Sebrae ao prompt
- [x] Salvar PDF em `docs/Guia-Definitivo-MEI-Sebrae-SC.pdf` (56 pp, 1.5 MB)
- [x] Extrair conteúdo via `pypdf` e triar: manter procedimentos oficiais (ainda válidos) + pedagogia; descartar valores numéricos desatualizados (R$60k, DAS R$44-50) e ferramentas descontinuadas (Payleven, ZeroPaper, Qipu, Precifica, Markeup, E.R.P.Flex, etc.)
- [x] Adicionar seção "GUIA SEBRAE — PROCEDIMENTOS PRATICOS" em `institucional.ts` (+130 linhas / ~2.050 tokens): formalização, alteração CCMEI, emissão DAS (PGMEI), DASN-SIMEI, NFS-e/NF-e, certidões negativas, baixa do MEI, 10 dicas Sebrae para buscar crédito, modalidades de financiamento, perfil do empreendedor, gestão do dia a dia (planejamento/pesquisa/operações/financeiro/vendas/pagamentos/marketing/atendimento/site), dados GEM 2015 (marcados como estruturais), canais Sebrae
- [x] Atualizar CLAUDE.md (projeto) com referência ao PDF como fonte oficial
- [x] Atualizar PRD para v1.3: bump versão, BASE_INSTITUCIONAL ~2.050 → ~4.100 tokens, total ~57.200 → ~59.250, seção 5.1 expandida com linha dedicada + nota editorial, seção 5.5 com 5 novas perguntas, anexo 9.2 atualizado, changelog no fim
- [x] Regenerar `~/Downloads/PRD-MaxImpulso.pdf` (21 pp, 900 KB) via python-markdown + Chrome headless

Commits: `b5c6534` feat(prompts): integrar Guia Sebrae-SC à base institucional · `dec4e42` docs(prd): v1.3

---

## Etapa 20: Observabilidade do prompt ✅ (2026-04-21 noite)

Sistema de log de citações (gurus + livros) por mensagem do assistente, com dashboard admin para iterar a curadoria.

### Detecção
- [x] `web/src/lib/observability/citations-catalog.ts`: catálogo canônico com 13 gurus + 23 livros e patterns regex calibrados
  - Nomes únicos (Cerbasi, Rufino, Arcuri) aceitos sozinhos
  - Nomes ambíguos (Marcus, Rodrigo, Thiago) exigem sobrenome
  - "Mindset" exige Dweck/autor no contexto (palavra genérica em pt-BR)
  - "Rework" exige Jason Fried (verbo comum em inglês)
- [x] `web/src/lib/observability/detect-citations.ts`: normaliza para global regex, conta ocorrências por `citation_key`
- [x] Retorna array `{type, key, name, count}` por mensagem analisada

### Pipeline de log
- [x] Migration `web/sql/migration-citations.sql`: tabela `prompt_citations` com FKs (message/conversation/user) + snapshot (setor/estagio/faturamento_mensal) + citation_type/key/name/count + índices por user_created/estagio/setor/key/message. RLS habilitado sem policies (acesso só via service-role).
- [x] `web/src/lib/observability/log-citations.ts`: helper fire-and-forget, usa service-role, loga erros sem propagar
- [x] Integração em `api/chat/route.ts`: capturar id do assistant message via `.insert(...).select('id').single()`, chamar logCitations com snapshot do userProfile carregado no início do fluxo

### Dashboard admin
- [x] `web/src/app/api/admin/citations/route.ts`: GET com filtros `estagio`, `setor`, `since` (7d/30d/90d). Agregação em memória (~2k linhas). Retorna ranking com total/mentions/uniqueUsers/byEstagio/bySetor. Protegido por `ADMIN_EMAILS` + service-role.
- [x] `web/src/app/admin/citations/page.tsx`: dashboard Tropical Maximalista com seletor de estágio, campo setor com datalist, seletor de período. Tabelas separadas para gurus e livros ordenadas por total. Barrinha visual proporcional ao máximo. Top estágio e top setor em linha.
- [x] `web/src/app/admin/citations/layout.tsx`: metadata `robots: noindex`, title "Citações do prompt | Max Impulso"
- [x] Link no header de `/admin` para `/admin/citations` (botão Sparkles)

Commit: `75d7763` feat(observability): logar gurus/livros citados por estágio/setor

**Passo manual após deploy**: rodar `web/sql/migration-citations.sql` no Supabase SQL Editor (já rodado — 21/04/2026 noite). Sem ele o log falha silenciosamente (console.error), nada quebra no fluxo do chat.

---

## Etapa 21: QA visual em produção via Playwright + 3 fixes ✅ (2026-04-21 noite)

Tour visual completo em `maximpulso.com.br` (desktop + mobile, light + dark) nas 10 superfícies: /login, /register, /forgot-password, /reset-password, /onboarding, chat (existente + empty state), /profile, /settings, /admin, /admin/citations. Identificados 3 bugs, todos corrigidos em paralelo via 3 subagents e deploy executado (commit `9571014`).

### Bug 1 — Token `--ink` invertido no dark (14 pontos)
`--ink: #FCD34D` no `.dark` era igual ao `--sun`, então `text-ink` sobre `bg-[var(--sun)]` virava sol-sobre-sol invisível.

Afetados: brand badge M (auth + chat), avatar assistant (message-bubble, streaming-message, typing-indicator), 2 de 4 chips do empty state, CTAs "Salvar" em /profile e /onboarding, "Atualizar senha" em /settings, "Exportar CSV" em /admin, botão send do chat-input, ícones palette/shield de /settings, contador de passos /onboarding, ícones de sucesso Mail/CheckCircle em /register, /forgot-password, /reset-password, hover state dos FABs e paginação admin.

Fix: introduzido token semântico **`--on-bright`** (sempre escuro: `#0F3E2A` light, `#0A1A12` dark) registrado como `--color-on-bright` no `@theme inline` do Tailwind v4. Substituído `text-ink` por `text-on-bright` em 14 pontos. Bordas e hard shadows mantidas amarelas no dark (assinatura visual intacta).

### Bug 2 — Mismatch `crescimento` vs `em_crescimento`
Prompt/DB usam `"crescimento"` (diagnostico.ts:18) mas frontend usava `"em_crescimento"` como chave. Badge do /admin sem classe aplicada, select do /profile sem opção correta, filtro de /admin/citations sem match.

Fix: alinhado em `"crescimento"` em 3 arquivos (profile, admin, admin/citations).

### Bug 3 — Acentos pt-BR faltando
- `register/page.tsx:258`: "Ja tem conta?" → "Já tem conta?"
- `chat-input.tsx:70`: placeholder "O que voce gostaria de saber?" → "você"

### Execução paralela via agents
3 subagents com escopo de arquivo disjunto:
- Agent A: globals.css + chat components + onboarding + settings
- Agent B: profile + admin + admin/citations
- Agent C: (auth) layout + register + forgot-password + reset-password

Todos retornaram typecheck limpo. Build (`next build`) OK, 23 páginas. Deploy via `vercel --prod` em 36s. QA visual em produção após deploy confirmou todos os fixes funcionando no dark mode.

Commit: `9571014 fix(theme): conserta contraste no dark + alinha estagio + acentos` (16 arquivos, +33/-30)

---

## Etapa 22: Bloco vendas dedicado — profundidade em "vender mais" ✅ (2026-04-22)

Teste com empreendedor real sinalizou que a sessão "vender mais" estava rasa. Mapeamento confirmou: o conteúdo vivia espalhado entre `impulso-stone.ts` (módulo 2 prometia "11 estratégias Instagram" / "13 estratégias WhatsApp" sem listar), perfis de Érico/Conrado/Pedro em `conhecimento.ts`, 3 linhas sobre Bora Vender em `livros.ts`. Nada sistemático sobre scripts, objeções, negociação, copywriting, follow-up, pós-venda, indicação, disciplina de vendedor.

### Entregáveis

- **Novo `web/src/lib/prompts/vendas.ts`** (548 linhas, ~11k tokens) — 10 seções: (1) princípios fundamentais (CHA, 4 mitos); (2) cliente ideal (8 perguntas, jornada 4 estágios, 20/80); (3) scripts de abordagem (declaração de força, DM Insta, WhatsApp, cold mail, balcão); (4) **11 estratégias Instagram + 13 estratégias WhatsApp** destrinchadas com exemplo por nicho (dívida do Impulso Stone finalmente paga); (5) SPIN Selling com roteiro de 10 perguntas; (6) tratamento de 6 objeções clássicas do MEI BR (cada uma com 2-3 respostas prontas); (7) copywriting (AIDA/PAS/4U/BAB + 9 gatilhos mentais); (8) régua de follow-up em 7 tempos + técnicas de fechamento; (9) pós-venda, recompra, indicação e reativação (Carnegie aplicado); (10) mentalidade e rotina de vendedor solo (Alfredo + Joel Jota moderando hustle).
- **Alfredo Soares (@tioricco) como 13º guru** em `conhecimento.ts` (+59 linhas, padrão denso tipo Érico Rocha) — bio XTECH/VTEX, tese de execução, CHA, funil 4 fundamentos, jornada, SPIN, 9 gatilhos, LTV≥3×CAC, 4 estatísticas-âncora de follow-up, estratégia War, 8 frases-chave.
- **Entrada Bora Vender expandida** em `livros.ts` de 3 → ~55 linhas, foco em frameworks (CHA, 4 mitos, 5 dicas Thiago Concer, jornada, SPIN, 9 gatilhos, 17 etapas do capítulo bônus de e-commerce, estatísticas de follow-up).
- **Módulo 2 do Impulso Stone enxugado** — deixou de prometer "11 estratégias Instagram" sem entregar, vira cross-reference sutil ao bloco novo.
- **`index.ts`** importa `BASE_VENDAS` e insere entre ecommerce e ferramentas.

### Fonte principal

Livro **"Bora Vender: a melhor estratégia é atitude"** (Alfredo Soares, Editora Gente 2019, 194pp), lido na íntegra por subagente. Trechos e frases-âncora citados com número de página quando literal (p.36, 57, 62, 69, 72, 90, 106, 107, 111, 119, 120, 125, 127, 129-130, 134, 166-174, 177).

### Impacto

- Prompt: 59k → ~70k tokens (~35% do contexto 200k, ainda com folga).
- 5 commits de código + spec (`docs/superpowers/specs/2026-04-22-bloco-vendas-design.md`) + plano (`docs/superpowers/plans/2026-04-22-bloco-vendas.md`).
- Deploy: `dpl_8uLq33VJQ2WseYSY2tQ2rpcGVu3S` → https://maximpulso.com.br (build em 16s, 37s total).

### Cuidados editoriais aplicados

- Linguagem hustle do Alfredo moderada com equilíbrio do Joel Jota (saúde > família > trabalho, disciplina > motivação).
- Táticas de "percepção" no limite ético do livro (foto em escritório emprestado, 0800 com 3 nomes) NÃO incorporadas.
- Conteúdo datado (Buscapé, Socialrocket que fere ToS) filtrado.
- M&A/valuation do cap. 9 ignorado (inaplicável a MEI).
- Plaintext ASCII sem acentos no system prompt (convenção do projeto).

Commits sequenciais:
- `42595ce` docs(spec): bloco vendas
- `231c829` docs(plan): plano de implementação
- `cf0f4e2` feat(prompts): vendas.ts com 10 seções (+548)
- `e948c52` feat(prompts): Alfredo Soares 13º guru (+59)
- `86e0aeb` chore(prompts): enxuga módulo 2 Impulso Stone (-5 +5)
- `8b415f4` feat(prompts): expande Bora Vender em livros.ts (+58 -3)
- `636ec7e` feat(prompts): integra BASE_VENDAS no system prompt (+2)

### Próximo passo manual

Teste interativo no chat de produção com 3 prompts de validação:
1. "Como vender mais na internet?" — deve trazer frameworks concretos (CHA, jornada, SPIN) + exemplos do setor do usuário, não bullets genéricos.
2. "Meu cliente fala que tá caro, o que faço?" — deve trazer pelo menos 2 das 3 respostas prontas da seção 6 (ancoragem reversa, resumo de valor, parcelamento).
3. "Quais são as 11 estratégias de Instagram do Impulso Stone?" — deve listar as 11 com números (a dívida foi paga).

Observar `/admin/citations` ao longo dos próximos dias para confirmar que "Alfredo Soares" e "Bora Vender" aparecem como fontes citadas. Se não aparecerem, pode ser preciso atualizar `lib/observability/citations-catalog.ts`.

---

## Etapa 23: Input de áudio via Groq Whisper Turbo ✅ (2026-04-22)

Empreendedores MEIs comunicam naturalmente por áudio no WhatsApp. Adicionar input de voz no chat reduz fricção em mobile/ambiente barulhento (feira, balcão, carro) e expande cenários de uso. Validado em produção com usuário real: "funcionou perfeitamente".

### Entregáveis

- **Novo `web/src/lib/groq.ts`** (17 linhas) — wrapper lazy do SDK Groq com `getGroqClient()` + `isGroqConfigured()`.
- **Novo `web/src/app/api/transcribe/route.ts`** (93 linhas) — POST multipart, valida sessão Supabase, chama `whisper-large-v3-turbo` com `language='pt'` + `temperature=0`, retorna `{text}`. Runtime `nodejs`, `maxDuration=60`. Logs estruturados JSON com `userId/audioBytes/charCount/groqLatencyMs/success` — **sem** texto transcrito. 6 códigos HTTP mapeados: 401/400/413/429/502/503.
- **Novo `web/src/hooks/use-voice-recorder.ts`** (246 linhas) — hook encapsulando `MediaRecorder`. Interface: `{ state, elapsedMs, error, startRecording, stopRecording, cancelRecording }`. MIME detection (WebM/Opus → WebM → MP4 → default). Cap 2min auto-stop, min 1s. Cleanup no unmount. Áudio com `echoCancellation + noiseSuppression + autoGainControl`.
- **Novo `web/src/components/chat/mic-button.tsx`** (159 linhas) — 3 estados visuais Tropical Maximalista: `idle` (Mic, bg-popover), `recording` (Square, bg-coral pulsando + timer MM:SS ao lado), `transcribing` (Loader2 spinning, bg-sun). Sonner toasts para 7 erros distintos (permissão negada, sem mic, browser não suportado, áudio curto, áudio longo, rate limit, sem conexão). Autodetecta suporte de browser — se falha, não renderiza.
- **`chat-input.tsx` modificado** (+18 linhas) — MicButton entre textarea e send quando `NEXT_PUBLIC_VOICE_ENABLED=true`. Callback `handleTranscribed` **anexa** ao final do value atual (não sobrescreve rascunho), foca textarea e posiciona cursor ao fim.
- **`package.json`** — adicionada dep `groq-sdk` (~300KB).
- **`.env.local.example`** — documenta `GROQ_API_KEY` e `NEXT_PUBLIC_VOICE_ENABLED`.

### Decisões editoriais

- **Tap-to-toggle + preview editável** (vs hold-to-record direto). Empreendedor confere o texto antes de enviar, evitando "frustração silenciosa" por erros de transcrição em ambiente barulhento.
- **Botão sempre visível** (vs mic-quando-vazio/send-quando-digitado). Não esconde affordance de quem nunca usou.
- **Zero storage de áudio** — Blob vai da memória Node direto pro Groq e some. Sem LGPD, sem storage cost.
- **Feature flag `NEXT_PUBLIC_VOICE_ENABLED`** — build-time constant, esconde MicButton se não "true".
- **Fallback gracioso** — se browser não suporta MediaRecorder OU flag desligada, MicButton não renderiza. Sem erro, sem UI quebrada.

### Stack técnica

- **Groq `whisper-large-v3-turbo`** — PT-BR excelente, ~3× mais rápido que Whisper Large v3, mesma qualidade. Custo ~$0.0007/min.
- **MediaRecorder API** — WebM/Opus nativo, fallback MP4 para Safari iOS <18.
- **Sonner** para toasts (já estava instalado).
- **Runtime Node** no endpoint (não edge — SDK Groq precisa Node APIs + multipart).

### Impacto

- **Custo estimado**: 100 MEIs × 10min/dia = ~$21/mês. 200 MEIs × 15min/dia = ~$63/mês. Rodinha.
- **Token budget do prompt**: ZERO impacto (é backend). Prompt permanece ~70k tokens.
- **Código novo**: ~515 linhas (4 arquivos novos + 1 modificado).
- **Dependência nova**: `groq-sdk` (única).
- **Deploy**: `dpl_24pCT1bdbQXKUXJq4fUqVEma2TQn` em https://maximpulso.com.br.

### Smoke test em produção

Usuário testou fluxo completo em mobile:
1. Tap no mic → permissão liberada → botão fica coral pulsando com timer
2. Falar pergunta por ~8s → tap de novo → loader amarelo → texto aparece no textarea
3. Editar se necessário → tap em send → resposta normal do Max chega por streaming

**Resultado: "funcionou perfeitamente".**

### Env vars Vercel (production)

- `GROQ_API_KEY` (sensível, encrypted)
- `NEXT_PUBLIC_VOICE_ENABLED=true` (build-time)

Preview ainda não configurado — Vercel CLI tem bug com "all preview branches" em `vercel env add`. Se precisar habilitar em preview (ex: testar PRs antes do merge), adicionar manualmente no dashboard em Settings → Environment Variables.

Commits sequenciais:
- `2506704` docs(spec): input de áudio via Groq Whisper Turbo
- `9594a10` docs(plan): plano de implementação
- `a6f59e8` chore(deps): adiciona groq-sdk
- `5e93627` feat(audio): wrapper lazy do cliente Groq
- `edf2ee8` feat(audio): endpoint /api/transcribe
- `44d738c` feat(audio): hook useVoiceRecorder (MediaRecorder)
- `950f449` feat(audio): componente MicButton com 3 estados
- `806edea` feat(audio): integra MicButton no chat-input

### Pendências pós-deploy

- [ ] **Migrar Groq free tier → pay-per-token** (quando for o momento)
  - **Quando**: após 1-2 semanas de uso em produção, validando qualidade da transcrição em mobile real com múltiplos empreendedores (não só o smoke test inicial). Se houver ≥20 MEIs usando áudio regularmente e/ou começar a bater no rate limit (30 req/min, 14.400 req/dia do free tier), é hora de migrar.
  - **Como**: em [console.groq.com](https://console.groq.com) → Billing → adicionar método de pagamento e ativar plano pay-per-token. A `GROQ_API_KEY` não muda (é a mesma key); o plano é associado à conta. Preço: ~$0.04/hora de áudio no Whisper Turbo. Limite de rate vai a 60 req/min e 28.800 req/dia (conforme tier).
  - **Sinais que indicam hora de migrar**:
    1. Logs no Vercel mostrando `error: "rate_limited"` em `/api/transcribe`
    2. Toasts "Muitas gravações seguidas. Aguarda uns segundos." reportados por usuários
    3. Crescimento consistente de volume (>500 transcrições/dia sustentadas)
  - **Antes de migrar**: validar qualidade PT-BR com ≥5 áudios reais de nichos diferentes (confeiteira, esteticista, prestador de serviço, loja, MEI em geral) para ter certeza que o modelo atende antes de pagar.

- [ ] **Habilitar GROQ_API_KEY + NEXT_PUBLIC_VOICE_ENABLED em Preview Vercel** — via dashboard (Vercel CLI tem bug para "all preview branches"). Permite testar PRs com áudio antes do merge.

- [ ] **Atualizar `lib/observability/citations-catalog.ts`** se Alfredo Soares não aparecer em `/admin/citations` depois de alguns dias — verificar regex do nome.

- [ ] **Considerar voice-to-voice** (Claude responder em áudio via TTS) como feature futura. Feature separada, custo e complexidade adicionais. Só depois que input por áudio estiver consolidado e validado em mobile real.
