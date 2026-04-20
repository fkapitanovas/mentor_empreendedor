# Mentor Empreendedor

## Project Overview
Mentor virtual para microempreendedores brasileiros (MEIs, MEs, autônomos). Combina conhecimento de múltiplos gurus do empreendedorismo em uma interface de chat com IA.

### Stack (Web App — atual)
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **UI**: Tailwind CSS v4 + shadcn/ui (Radix UI)
- **Database**: Supabase (Auth + PostgreSQL)
- **LLM**: Claude API (Anthropic) via `@anthropic-ai/sdk` — modelo `claude-sonnet-4-6`
- **Deploy**: Vercel
- **URL**: https://web-theta-ashen-35.vercel.app

### Stack (WhatsApp Chatbot — legado, deprioritizado)
- **Backend**: Python 3.9 + FastAPI
- **Messaging**: Twilio (WhatsApp Sandbox)
- **Deploy**: Railway — https://faithful-intuition-production-82bb.up.railway.app

### Architecture
- Chat minimalista estilo Claude.ai com streaming SSE
- Múltiplas conversas por usuário (sidebar com lista)
- System prompt modular (14 blocos + 2 dinâmicos): Identidade/Tom, Base de Conhecimento (12 gurus), Base de Livros (22 livros incl. Lucro Primeiro), Regras de Interação, Personalização, Resolução de Conflitos (9 tensões), Referências Nicho, Base Institucional, Base Impulso Stone, Formalização MEI, E-commerce/Marketplaces, Ferramentas Práticas, Diagnóstico/Atualização de Perfil
- Onboarding opcional: formulário com 5 campos ou pular (IA captura organicamente)
- Diagnóstico via conversa: Claude extrai perfil e sinaliza via tag `[PERFIL_EXTRAIDO]`
- Atualização dinâmica: Claude detecta mudanças e sinaliza via tag `[PERFIL_ATUALIZADO]`
- Tags removidas no client (`cleanProfileTags()` no useChat) antes de renderizar + ao carregar do DB
- Admin: `/admin` com tabela de perfis + exportação CSV, protegido por `ADMIN_EMAILS` env var
- Memória de longo prazo: resumos a cada 20 mensagens, injetados no system prompt
- Contexto: 100 últimas mensagens + resumo comprimido
- Título de conversa gerado automaticamente via Claude Haiku após 1ª mensagem
- Auth: email + senha (Supabase Auth), esqueci senha, confirmação de email, toggle de senha
- Dark mode: light + dark + sistema (segmented control em settings, icon toggle no header)
- Design: tema "Tropical & Vibrante" — Plus Jakarta Sans (headings) + DM Sans (body), paleta emerald/amber, dark mode neutro

### Supabase
- **Project ref**: wlpglssnqkjsydjylxjj
- **Tabelas**: users, conversations, messages, conversation_summaries
- **Trigger**: `handle_new_user()` — auto-cria perfil em `public.users` quando signup em `auth.users`
- **RLS**: habilitado em todas as tabelas com policies por auth.uid()
- **Auth callback**: `/auth/callback` troca code por session (email confirm + password reset)

### Dev Local
```bash
cd ~/Mentor_Empreendedor
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Em outro terminal:
ngrok http --domain toylike-chelsey-esophageal.ngrok-free.dev 8000
# Para dev local, trocar webhook no Twilio para URL ngrok + /webhook
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
│   │   │   │   ├── livros.ts        # 22 livros (deduplicado vs perfis)
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
