# Mentor Empreendedor

## Project Overview
Mentor virtual para microempreendedores brasileiros (MEIs, MEs, autônomos). Combina conhecimento de múltiplos gurus do empreendedorismo em uma interface de chat com IA.

### Stack (Web App — atual)
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **UI**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Database**: Supabase (Auth + PostgreSQL)
- **LLM**: Claude API (Anthropic) via `@anthropic-ai/sdk` — modelo `claude-sonnet-4-6`
- **Deploy**: Vercel
- **URL**: https://maximpulso.com.br (alias de produção)

### Stack (WhatsApp Chatbot — legado, deprioritizado)
- **Backend**: Python 3.9 + FastAPI
- **Messaging**: Twilio (WhatsApp Sandbox)
- **Deploy**: Railway — https://faithful-intuition-production-82bb.up.railway.app

### Architecture
- Chat minimalista estilo Claude.ai com streaming SSE
- Múltiplas conversas por usuário (sidebar com lista)
- System prompt modular (14 blocos + 2 dinâmicos): Identidade/Tom, Base de Conhecimento (13 gurus incl. Ana Fontes), Base de Livros (23 livros, curadoria v1.2 — foco em MEI BR), Regras de Interação, Personalização, Resolução de Conflitos (9 tensões), Referências Nicho (26 influenciadores), Base Institucional (Sebrae + gov.br), Base Impulso Stone (8 módulos), Formalização MEI, E-commerce/Marketplaces, Ferramentas Práticas, Diagnóstico/Atualização de Perfil
- **PRD documentado** em `docs/PRD.md` (v1.2) — matrizes fase × assunto, tipo de negócio × guru, fontes institucionais detalhadas, mecanismo de adequação de respostas. PDF sempre disponível em `~/Downloads/PRD-MaxImpulso.pdf`.
- Onboarding opcional: formulário com 5 campos ou pular (IA captura organicamente)
- Diagnóstico via conversa: Claude extrai perfil e sinaliza via tag `[PERFIL_EXTRAIDO]`
- Atualização dinâmica: Claude detecta mudanças e sinaliza via tag `[PERFIL_ATUALIZADO]`
- Tags removidas no client (`cleanProfileTags()` no useChat) antes de renderizar + ao carregar do DB
- Admin: `/admin` com tabela de perfis + exportação CSV, protegido por `ADMIN_EMAILS` env var
- Memória de longo prazo: resumos a cada 20 mensagens, injetados no system prompt
- Contexto: 100 últimas mensagens + resumo comprimido
- Título de conversa gerado automaticamente via Claude Haiku após 1ª mensagem
- Auth: email + senha (Supabase Auth), esqueci senha, confirmação de email, toggle de senha
- Email: Resend via SMTP (smtp.resend.com:465), sender `Max Impulso <noreply@maximpulso.com.br>`, templates pt-BR com branding
- Domínio: maximpulso.com.br (ativo, DNS propagado, SSL emitido)
- Dark mode: light + dark + sistema (segmented control em settings, icon toggle no header com ícones Sun/Moon/Monitor dinâmicos)
- Design: tema **"Tropical Maximalista"** (redesign 21/04/2026) — Bricolage Grotesque (display) + IBM Plex Sans (body), paleta jungle `#0F3E2A` + coral `#F87171` + sol `#FCD34D` + creme `#FFF8E7`, hard shadows solid-color, gradient mesh animado, grain overlay global, cards bordados 3px ink com shapes decorativos (círculo coral + quadrado amarelo)

### Design tokens (globals.css)
- Cores nomeadas: `--ink`, `--coral`, `--sun`, `--cream`, `--jungle`
- Gradientes: `--gradient-brand` (verde→jungle), `--gradient-brand-strong` (coral→sol), `--gradient-brand-text`, `--gradient-tropical`
- Hard shadows: `.shadow-hard-sm` (4px), `.shadow-hard` (6px), `.shadow-hard-lg` (10px) — solid, no blur
- Utilities: `.tropical-mesh` (gradient mesh animado 24s), `.animate-wave`, grain global via `body::after`
- Escala tipográfica: `--text-xs..--text-6xl`; radius canônico shadcn-style

### Acessibilidade & Performance (auditorias 20–21/04/2026)
- WCAG AA: contraste 4.5:1+, `aria-live="polite"` em streaming, `role="log"` no chat, skip-link, landmarks (banner/navigation/main), `aria-current="page"` em conversas
- Auto-scroll inteligente (não força scroll se usuário rolou para cima), stop-streaming com `AbortController`, retry inline em erros de chat
- `MessageBubble` memoizada com `memo()` + `useMemo(formatContent)`
- `autoComplete` e `inputMode` em todos inputs de auth/onboarding
- `reduced-motion` respeitado globalmente
- PWA: `manifest.webmanifest`, ícones 192/512/maskable (gerados via sharp)
- Metadata individual por rota (8 layout.tsx) com template `"%s | Max Impulso"`
- `AlertDialog` lazy-loaded via `next/dynamic` em conversation-item
- `optimizePackageImports: ['lucide-react', 'date-fns', '@supabase/ssr', '@supabase/supabase-js']`

### Polimento de UX (pós-redesign, 21/04/2026)
- **Heading contextual em `/login`**: primeira vez → "Bora empreender."; retornando → "Volta aí, bora crescer.". Flag `max-has-logged-in` em localStorage, setada após `signInWithPassword` OK.
- **FABs de scroll** (↑↓) no chat quando conversa tem 4+ mensagens. Posição via inline style `calc(env(safe-area-inset-bottom, 0px) + 5rem)` — ARBITRARY TAILWIND NÃO FUNCIONA por causa do escape de vírgulas em `calc(env())` no JIT v4. Usar sempre inline style para safe-area + calc.
- **Deploy Vercel**: sempre `cd web && vercel --prod --yes` numa linha só — deploys da raiz criam projeto duplicado acidental.

### Supabase
- **Project ref**: wlpglssnqkjsydjylxjj
- **Tabelas**: users, conversations, messages, conversation_summaries
- **Trigger**: `handle_new_user()` — auto-cria perfil em `public.users` quando signup em `auth.users`
- **RLS**: habilitado em todas as tabelas com policies por auth.uid()
- **Auth callback**: `/auth/callback` troca code por session (email confirm + password reset)
- **SMTP**: Resend configurado via custom SMTP (host smtp.resend.com, port 465, user resend)
- **Site URL**: https://maximpulso.com.br (configurado no Auth → URL Configuration)
- **Email confirmation**: habilitado (mailer_autoconfirm: false)

### Dev Local — Web App (principal)
```bash
cd web
npm install
npm run dev           # Next.js em http://localhost:3000 (ou próxima porta livre)
npm run build         # Build de produção
npm run lint          # ESLint
npx tsc --noEmit      # Typecheck
vercel --prod --yes   # Deploy produção (do diretório web/)
```

### Dev Local — WhatsApp Chatbot (legado)
```bash
cd ~/mentor_empreendedor
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
ngrok http --domain toylike-chelsey-esophageal.ngrok-free.dev 8000
```

### Key Gotchas
- Python 3.9: usar `Optional[X]` do `typing`, nao `X | None`
- Twilio envia telefone como `whatsapp:+55...` (~28 chars) — campo `phone` no DB e VARCHAR(50)
- FastAPI com `Form(...)` requer pacote `python-multipart`
- ngrok (dev only): usar `--domain toylike-chelsey-esophageal.ngrok-free.dev` para manter URL fixa
- Railway: env vars no dashboard (nunca no código). `load_dotenv()` funciona sem .env presente

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Project Structure
```
mentor_empreendedor/
├── web/                         # Web App (Next.js — ATIVO)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/          # Login, registro, esqueci-senha, redefinir-senha
│   │   │   ├── (chat)/          # Layout principal + conversas
│   │   │   │   ├── layout.tsx   # Sidebar + header + área de chat
│   │   │   │   ├── page.tsx     # Entry point (redireciona para conversa)
│   │   │   │   └── c/[id]/      # Conversa específica
│   │   │   ├── onboarding/      # Formulário opcional pós-registro
│   │   │   ├── profile/         # Visualizar/editar perfil
│   │   │   ├── settings/        # Tema, senha, excluir conta
│   │   │   ├── auth/callback/   # Token exchange (email confirm + reset)
│   │   │   ├── admin/           # Painel admin (tabela + CSV export)
│   │   │   └── api/
│   │   │       ├── admin/users/ # GET — lista users JSON/CSV (admin only)
│   │   │       ├── chat/        # POST — streaming Claude SSE
│   │   │       ├── conversations/ # CRUD + título automático
│   │   │       └── auth/signout/  # Logout server-side
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui
│   │   │   ├── chat/            # message-bubble, message-list, chat-input, streaming
│   │   │   └── sidebar/         # conversation-list, conversation-item
│   │   ├── hooks/               # use-chat (streaming), use-conversations
│   │   ├── lib/
│   │   │   ├── supabase/        # client, server, middleware
│   │   │   ├── prompts/         # 14 blocos do system prompt
│   │   │   │   ├── conhecimento.ts  # 12 perfis de gurus (incl. Ana Fontes)
│   │   │   │   ├── livros.ts        # 23 livros (v1.2 curadoria MEI BR)
│   │   │   │   ├── formalizacao.ts  # MEI, DAS, migração ME, tributação
│   │   │   │   ├── ecommerce.ts     # Marketplaces, logística, vendas online
│   │   │   │   ├── ferramentas.ts   # Ferramentas por faixa de faturamento
│   │   │   │   ├── conflitos.ts     # 9 regras de resolução de tensões
│   │   │   │   └── ...              # identidade, regras, nichos, etc.
│   │   │   ├── profile-extractor.ts  # Regex + parsers (portado de mentor.py)
│   │   │   └── summary.ts      # Geração de resumos (portado de mentor.py)
│   │   └── types/database.ts   # User, Conversation, Message, ConversationSummary
│   └── sql/migration-web.sql   # DDL: conversations, RLS, trigger handle_new_user
├── app/                         # WhatsApp Chatbot (Python — LEGADO)
│   ├── prompts/system_prompt.py # Source original do system prompt (~66KB)
│   ├── services/mentor.py       # Source original dos extractors
│   └── ...
├── docs/superpowers/
│   ├── specs/                   # Spec da migração
│   └── plans/                   # Plano de implementação
└── CLAUDE.md
```

### Comandos (Web App)
```bash
cd web
npm run dev          # Dev server
npm run build        # Build de produção
vercel --prod        # Deploy produção
```

## Key Domain Context
- Público-alvo: MEIs e microempresários (faturamento até R$ 360 mil/ano)
- Idioma: Português brasileiro (todas as interações)
- Tom do bot: prático, acolhedor, direto — como um amigo experiente
- Nunca dar conselho jurídico/contábil definitivo
- Nunca prometer resultados financeiros específicos
- Sempre contextualizar para realidade brasileira (MEI, Simples Nacional, PIX, etc.)

## Fontes do conteúdo (em `docs/`)

Todo o conteúdo curado do system prompt vem dos arquivos originais do projeto, mantidos em `docs/` para referência:

- **`docs/agente_microempreendedor.docx`** — documento-mãe da base de conhecimento. Contém:
  - Perfis detalhados dos 12 gurus (Marcus Marques, Flávio Augusto, Thiago Oliveira, Thiago Nigro, Nathalia Arcuri, Gustavo Cerbasi, Rodrigo Almeida, Érico Rocha, Conrado Adolpho, Pedro Sobral, Joel Jota, Geraldo Rufino; + Ana Fontes adicionada depois)
  - Lista dos 22 livros-base com conceitos-âncora (expandida depois para 23 na v1.2)
  - Este doc alimenta `web/src/lib/prompts/conhecimento.ts` (perfis) e `web/src/lib/prompts/livros.ts` (resumos dos livros)

- **`docs/PRD.md`** — documento de requisitos do produto (v1.2, 21/04/2026). Fonte canônica da arquitetura do system prompt, matrizes de maturidade, fontes institucionais e mecanismo de adequação. Regenera PDF via `python3 markdown + Chrome headless` para `~/Downloads/PRD-MaxImpulso.pdf`.

- **`docs/influencers_impulso_stone.xlsx`** — lista de influenciadores nichados por setor (confeitaria, beleza, marketing, finanças populares, etc.), com afinidade MEI. Alimenta `web/src/lib/prompts/nichos.ts`.

- **`docs/Geração de Valor – Flávio Augusto.pdf`**, **`docs/Geração de Valor 2 - ...pdf`**, **`docs/Geração de Valor 3 - ...pdf`** — livros lidos na íntegra para enriquecer conceitos além dos resumos do docx.

- **`docs/Guia-Definitivo-MEI-Sebrae-SC.pdf`** — e-book do Sebrae-SC com passo-a-passo oficial de formalização, emissão de DAS/DASN/NF, baixa, certidões negativas, 10 dicas para buscar crédito, perfil do empreendedor. Alimenta a seção "GUIA SEBRAE — PROCEDIMENTOS PRATICOS" em `web/src/lib/prompts/institucional.ts`. Dados numéricos específicos do PDF (limite R$60k, DAS R$44-50, pesquisa GEM 2015) **não** são usados — valores atuais (R$81k, DAS baseado em salário mínimo R$1.621, etc.) vêm da seção principal de `institucional.ts`. O guia contribui apenas com procedimentos (ainda válidos), dicas pedagógicas e princípios de gestão.

- **Livros lidos na íntegra (externos ao `docs/`, registrados no cabeçalho de `livros.ts`)**: O Mito do Empreendedor (Gerber), O Poder do Hábito (Duhigg — full), Obsessão pelo Cliente (Bryar/Carr), Primeiro Pergunte Porquê (Sinek), Lucro Primeiro (Michalowicz), Essencialismo (McKeown), Mindset (Dweck), Pai Rico Pai Pobre (Kiyosaki — resumo). Negócios: um assunto de mulheres (Ana Fontes) — transcrição Kindle→MD em `~/Documents/livros/negocios-assunto-de-mulheres.md`.

**Curadoria v1.2 (21/04/2026):** 3 livros removidos por desalinhamento com MEI BR (De Zero a Um, O Lado Difícil das Coisas Difíceis, Sonho Grande); 3 livros reduzidos drasticamente (Obsessão pelo Cliente 195→45 linhas, Empresas Feitas para Vencer 35→15, A Startup Enxuta 30→15). Ver seção 8.3 do PRD para razões e lista de "não voltar".

**Importante:** se atualizar livros.ts ou conhecimento.ts, sempre manter fidelidade ao docx original. Mudanças substantivas de conteúdo devem ser validadas com o usuário antes (o prompt representa curadoria editorial).

## Referências de Conteúdo por Nicho

Além dos gurus generalistas (doc `agente_microempreendedor.docx`), o agente deve considerar influenciadores nichados (fonte: `influencers_impulso_stone.xlsx`) para contextualizar respostas por setor:

### Marketing Digital & Vendas Online
- **Ana Tex** — Vendas e funil simples, didática para iniciantes (Afinidade MEI: 5)
- **Rafael Kiso** — Tráfego e growth para PMEs (Afinidade MEI: 4)
- **Camila Porto** — Instagram para vendas, muito prática (Afinidade MEI: 5)
- **Alex Vargas** — Renda online, grande base iniciante (Afinidade MEI: 5)
- **Paula Tebett** — Marketing simples para MEI (Afinidade MEI: 4)

### Confeitaria & Doces
- **Marrara Bortoloti** — Precificação para confeiteiras (Afinidade MEI: 5)
- **Confeiteiro Empreendedor** — Gestão de negócio de doces (Afinidade MEI: 5)
- **Chef Leo Oliveira** — Escala de produção, conteúdo técnico (Afinidade MEI: 5)
- **Bruna Ramos** — Negócio de doces, regional forte (Afinidade MEI: 5)
- **Doce Negócio BR** — Doces lucrativos, alta conversão (Afinidade MEI: 5)

### Beleza & Estética
- **Natalia Beauty** — Empreendedorismo em estética, alta autoridade (Afinidade MEI: 5)
- **Karen Bachini** — Marca própria em beleza (Afinidade MEI: 4)
- **Lash Business** — Gestão de negócio de cílios (Afinidade MEI: 5)
- **Manicure Empreendedora** — Gestão de salão para manicures (Afinidade MEI: 5)
- **Marketing para Salão** — Marketing local para salões (Afinidade MEI: 5)

### Finanças Populares
- **Nath Finanças** — Finanças para baixa renda, alta conexão (Afinidade MEI: 5)
- **Favelado Investidor** — Investimento simples, linguagem popular (Afinidade MEI: 5)
- **Gabi Oliveira** — Educação financeira popular (Afinidade MEI: 5)
- **Grana Preta** — Finanças periféricas, alta identificação (Afinidade MEI: 5)

### MEI & Negócios Gerais
- **Vida de MEI** — Rotina e dia a dia do MEI, muito aderente (Afinidade MEI: 5)
- **Ideias de Negócios** — Ideias práticas, conteúdo viral (Afinidade MEI: 5)

### Moda & Loja
- **Ana Bochi** — Loja online de moda, nano influencer forte (Afinidade MEI: 5)
- **Loja Lucrativa** — Vendas simples para moda MEI (Afinidade MEI: 5)

### Gastronomia
- **Hamburguer Perfeito** — Food business, conteúdo prático (Afinidade MEI: 5)

### Creator Economy
- **Nath Araújo** — Creator economy, boa comunicação (Afinidade MEI: 4)

> **Nota**: O agente deve usar essas referências nichadas para contextualizar respostas quando identificar o setor do empreendedor. Ex: confeiteira recebe dicas alinhadas com Marrara Bortoloti; esteticista recebe abordagem de Natalia Beauty. Os conceitos são integrados sem necessariamente citar os nomes.
