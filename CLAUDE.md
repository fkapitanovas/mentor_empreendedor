# Mentor Empreendedor

## Project Overview
Chatbot via WhatsApp que funciona como mentor virtual para microempreendedores brasileiros (MEIs, MEs, autônomos). Combina conhecimento de múltiplos gurus do empreendedorismo em um único ponto de acesso.

### Stack
- **Backend**: Python 3.9 + FastAPI
- **Database**: Supabase (PostgreSQL)
- **Messaging**: Twilio (WhatsApp Sandbox)
- **LLM**: Claude API (Anthropic) — modelo `claude-sonnet-4-6`
- **Deploy**: Railway (produção, always-on)
- **Tunnel (dev)**: ngrok (domínio estático gratuito — URL fixa, apenas para dev local)

### Architecture
- 3 camadas: Diagnóstico → Orientação Temática → Personalização por Estágio
- 5 pilares: Gestão, Finanças, Marketing, Mentalidade, Inspiração
- System prompt modular (10 blocos + 2 dinâmicos): Identidade/Tom, Base de Conhecimento, Base de Livros, Regras de Interação, Personalização, Resolução de Conflitos, Referências Nicho, Base Institucional, Base Impulso Stone, Diagnóstico/Atualização de Perfil, Resumo de Conversa
- Diagnostico via conversa livre: Claude extrai perfil organicamente e sinaliza via tag `[PERFIL_EXTRAIDO]`
- Atualização dinâmica de perfil: Claude detecta mudanças explícitas e sinaliza via tag `[PERFIL_ATUALIZADO]`
- Memória de longo prazo: resumos de conversa gerados a cada 20 mensagens, injetados no system prompt
- Contexto: 100 últimas mensagens + resumo comprimido de conversas anteriores

### Produção (Railway)
- **URL**: https://faithful-intuition-production-82bb.up.railway.app
- **Webhook Twilio**: https://faithful-intuition-production-82bb.up.railway.app/webhook
- Deploy automático via `git push origin main`
- Env vars configuradas no dashboard do Railway
- `Procfile` define o comando de start
- `runtime.txt` define Python 3.9.18

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
Mentor_Empreendedor/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point + GET /health
│   ├── config.py             # Settings & env vars (from .env)
│   ├── routers/
│   │   ├── __init__.py
│   │   └── webhook.py        # POST /webhook — recebe msgs do Twilio
│   ├── services/
│   │   ├── __init__.py
│   │   ├── mentor.py         # Claude API — resposta, extração de perfil, parsing, resumos
│   │   ├── twilio_service.py # Envia WhatsApp (com split de msgs longas)
│   │   └── supabase_service.py # CRUD usuarios, historico, resumos de conversa
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py        # Pydantic models
│   └── prompts/
│       ├── __init__.py
│       └── system_prompt.py  # System prompt modular (10 blocos, ~66k chars)
├── sql/
│   └── schema.sql            # Tabelas users, messages, conversation_summaries
├── tasks/
│   ├── todo.md               # Current task tracking
│   ├── handoff.md            # Estado atual, URLs, acessos, proximos passos
│   └── lessons.md            # Self-improvement log
├── .env                      # Credenciais (NAO committar)
├── .env.example
├── .gitignore
├── requirements.txt
├── Procfile                 # Railway: comando de start (uvicorn)
├── runtime.txt              # Railway: versão do Python
└── CLAUDE.md
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
