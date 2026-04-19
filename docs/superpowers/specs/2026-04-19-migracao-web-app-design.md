# Mentor Empreendedor — Migração para Web App

## Contexto

O Mentor Empreendedor é um chatbot WhatsApp (Python/FastAPI/Twilio/Railway) que funciona como mentor virtual para MEIs e microempreendedores brasileiros. A integração Twilio se mostrou cara e com experiência ruim para o usuário. Este spec define a migração para um web app responsivo hospedado na Vercel, mantendo todo o conteúdo/prompts e as tabelas Supabase.

## Decisões de Design

| Decisão | Escolha |
|---------|---------|
| Auth | Email + senha (Supabase Auth) |
| Layout do chat | Minimalista (estilo Claude/ChatGPT) — centralizado, avatares discretos, max-width |
| Respostas | Streaming via SSE (Server-Sent Events) |
| Conversas | Múltiplas (sidebar com lista, criar nova conversa) |
| Tema | Light + Dark mode com toggle |
| Onboarding | Formulário opcional — preencher ou pular (IA captura organicamente) |

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI)
- **Supabase** (Auth + PostgreSQL)
- **Claude API** via `@anthropic-ai/sdk`
- **Deploy**: Vercel
- **Domínio**: a definir

## Arquitetura

### Fluxo de dados do chat

```
Usuário digita → POST /api/chat { conversationId, message }
  → API Route (server-side):
    1. Valida sessão (Supabase Auth)
    2. Carrega perfil do usuário
    3. Carrega histórico da conversa (últimas 100 msgs)
    4. Carrega resumo da conversa (se existir)
    5. Monta system prompt (10 blocos + perfil + resumo)
    6. Chama Claude com streaming (cache_control no system)
    7. Retorna ReadableStream (SSE) ao client
  → Client renderiza tokens em tempo real
  → Ao finalizar stream:
    8. Salva mensagem do usuário + resposta no Supabase
    9. Extrai perfil se tags [PERFIL_EXTRAIDO] ou [PERFIL_ATUALIZADO] presentes
    10. Se perfil extraído → atualiza users, confirma se diverge
    11. Se 20+ mensagens novas → gera summary em background
```

### Geração de título da conversa

Após a 1ª resposta do Max em uma nova conversa, chamada separada (não-streaming, claude-haiku-4-5 para economia) gera título de 3-5 palavras baseado na mensagem do usuário. Atualiza o título na tabela `conversations`.

## Modelo de Dados

### Tabela `users` (adaptar existente)

```sql
ALTER TABLE users
  DROP COLUMN IF EXISTS phone,
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS skipped_onboarding BOOLEAN DEFAULT false;
```

Campos preservados: `id`, `name`, `setor`, `estagio`, `tempo_negocio`, `faturamento`, `tempo_negocio_meses`, `faturamento_mensal`, `desafio_principal`, `is_onboarded`, `created_at`, `updated_at`.

### Tabela `conversations` (nova)

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nova conversa',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Tabela `messages` (adaptar existente)

```sql
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

Campo `user_id` mantido para queries rápidas de perfil. `conversation_id` torna-se o agrupador principal.

### Tabela `conversation_summaries` (adaptar existente)

```sql
ALTER TABLE conversation_summaries
  DROP CONSTRAINT IF EXISTS conversation_summaries_user_id_key,
  ADD COLUMN IF NOT EXISTS conversation_id UUID UNIQUE REFERENCES conversations(id) ON DELETE CASCADE;
```

Um resumo por conversa (não mais por usuário).

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (chat)/
│   │   ├── layout.tsx              # Sidebar + área de chat
│   │   ├── page.tsx                # Redirect para nova conversa ou última
│   │   └── c/[id]/page.tsx         # Conversa específica
│   ├── onboarding/page.tsx         # Formulário opcional pós-registro
│   ├── profile/page.tsx            # Visualizar/editar perfil
│   ├── settings/page.tsx           # Tema, senha, excluir conta
│   ├── api/
│   │   ├── chat/route.ts           # POST — streaming response via Claude
│   │   └── conversations/
│   │       ├── route.ts            # GET lista, POST criar
│   │       └── [id]/
│   │           ├── route.ts        # DELETE conversa
│   │           └── title/route.ts  # PATCH gerar/atualizar título
│   └── layout.tsx                  # Root layout (ThemeProvider, fonts)
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── chat/
│   │   ├── message-list.tsx        # Lista de mensagens com scroll
│   │   ├── message-bubble.tsx      # Bolha individual (user/assistant)
│   │   ├── chat-input.tsx          # Input + botão enviar
│   │   ├── streaming-message.tsx   # Renderiza tokens em tempo real
│   │   └── typing-indicator.tsx    # "Max está pensando..."
│   ├── sidebar/
│   │   ├── conversation-list.tsx   # Lista de conversas
│   │   └── conversation-item.tsx   # Item individual
│   ├── onboarding/
│   │   └── onboarding-form.tsx     # Formulário opcional
│   └── profile/
│       └── profile-form.tsx        # Visualizar/editar perfil
├── hooks/
│   ├── use-chat.ts                 # Estado do chat + streaming
│   └── use-conversations.ts       # CRUD conversas
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── prompts/
│   │   ├── index.ts                # buildSystemPrompt()
│   │   ├── identidade.ts           # Bloco 1: IDENTIDADE_E_TOM
│   │   ├── conhecimento.ts         # Bloco 2: BASE_CONHECIMENTO (gurus)
│   │   ├── livros.ts               # Bloco 3: BASE_LIVROS
│   │   ├── regras.ts               # Bloco 4: REGRAS_INTERACAO
│   │   ├── personalizacao.ts       # Bloco 5: PERSONALIZACAO_ESTAGIO
│   │   ├── conflitos.ts            # Bloco 6: RESOLUCAO_CONFLITOS
│   │   ├── nichos.ts               # Bloco 7: REFERENCIAS_NICHO
│   │   ├── institucional.ts        # Bloco 8: BASE_INSTITUCIONAL
│   │   ├── impulso-stone.ts        # Bloco 9: BASE_IMPULSO_STONE
│   │   ├── diagnostico.ts          # Bloco 10: INSTRUCOES_DIAGNOSTICO
│   │   └── atualizacao-perfil.ts   # Bloco 11: INSTRUCOES_ATUALIZACAO_PERFIL
│   ├── profile-extractor.ts        # Regex parsing de tags + parsers
│   ├── summary.ts                  # Geração de resumo via Claude
│   └── utils.ts                    # cn(), helpers
├── types/
│   └── database.ts                 # Interfaces TypeScript
└── middleware.ts                   # Auth redirect
```

## System Prompt — Portabilidade

Os 10 blocos do `app/prompts/system_prompt.py` são portados como constantes `string` em TypeScript, um arquivo por bloco em `src/lib/prompts/`. O conteúdo é idêntico — apenas o formato muda de triple-quoted Python strings para template literals TypeScript.

A função `buildSystemPrompt(user, summary?)` em `src/lib/prompts/index.ts`:
1. Concatena os 10 blocos estáticos
2. Injeta perfil do usuário no bloco de personalização (se `is_onboarded`)
3. Injeta resumo da conversa (se existir)
4. Retorna array de `{ type: "text", text, cache_control }` para a API do Claude

## Lógica de Extração de Perfil

Portada diretamente de `app/services/mentor.py`:

- `extractProfile(text)` — regex `\[PERFIL_EXTRAIDO\](.*?)\[\/PERFIL_EXTRAIDO\]`, parse JSON
- `extractProfileUpdate(text)` — regex `\[PERFIL_ATUALIZADO\](.*?)\[\/PERFIL_ATUALIZADO\]`
- `parseTempoMeses(text)` — "2 anos" → 24, "6 meses" → 6, "1 ano e meio" → 18
- `parseFaturamento(text)` — "R$ 10.000/mes" → 10000, "5mil" → 5000, "15k" → 15000
- `cleanResponse(text)` — remove tags antes de renderizar
- `standardizeProfileFields(data)` — aplica parsers, retorna campos padronizados

## Fluxo do Usuário

### 1. Primeiro acesso
- Registro (email + senha) → redirect para `/onboarding`
- Onboarding mostra formulário: nome, setor, tempo de negócio, faturamento, desafio principal
- Dois caminhos:
  - "Preencher" → salva perfil, `is_onboarded = true`, `skipped_onboarding = false`
  - "Pular e conversar" → `skipped_onboarding = true`, IA extrai na conversa

### 2. Chat (tela principal)
- Sidebar esquerda: lista de conversas (título + data relativa), botão "Nova conversa"
- Mobile: sidebar como sheet (hamburger no header)
- Área central: mensagens com streaming, input fixo no rodapé
- Header: avatar Max + "Max Impulso", ícones de perfil e settings
- Max-width ~720px no conteúdo das mensagens

### 3. Durante a conversa
- Streaming: tokens aparecem em tempo real, cursor piscante
- Ao concluir stream: salva ambas mensagens, verifica tags de perfil
- Se perfil extraído/atualizado → atualiza tabela `users` silenciosamente
- A cada 20 mensagens → gera summary em background (não bloqueia UX)
- Título gerado automaticamente após 1ª interação

### 4. Perfil (`/profile`)
- Mostra dados atuais em cards editáveis
- Campos: nome, setor, estágio, tempo, faturamento, desafio
- Salvar → atualiza diretamente no Supabase

### 5. Settings (`/settings`)
- Toggle tema claro/escuro
- Trocar senha
- Excluir conta (com confirmação)

## Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## O que é Preservado vs Substituído

### Preservado integralmente
- System prompt (10 blocos, ~66KB de conteúdo)
- Lógica de extração de perfil (regex, parsers)
- Lógica de geração de resumos
- Regras de interação e personalização por estágio
- Referências por nicho (confeitaria, beleza, finanças, etc.)
- Tabelas Supabase (com adaptações mínimas)

### Substituído
- Python/FastAPI → Next.js/TypeScript
- Twilio (WhatsApp) → Interface web com chat
- Railway → Vercel
- Webhook sync → Streaming SSE
- Conversa única → Múltiplas conversas
- Identificação por telefone → Email + senha
- Rate limiting in-memory → Não necessário (Vercel handles)

## Fora de Escopo (MVP)

- Notificações push/email
- Catálogo de artigos
- Exportação de dados (LGPD)
- Admin dashboard
- Integração WhatsApp futura
- PWA/offline
