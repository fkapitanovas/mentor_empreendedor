# Mentor Empreendedor — Migração Web App — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o Mentor Empreendedor de chatbot WhatsApp (Python/FastAPI/Twilio/Railway) para web app (Next.js/Vercel) com chat streaming, múltiplas conversas, e onboarding opcional.

**Architecture:** Next.js 16 App Router com Server Components por padrão. API Route (`/api/chat`) chama Claude com streaming e retorna SSE. System prompt modular (10 blocos ~66KB) portado de Python para TypeScript. Supabase para auth e dados. Layout minimalista estilo Claude.ai com sidebar de conversas.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, shadcn/ui, Supabase (@supabase/ssr), @anthropic-ai/sdk, Vercel

**Spec:** `docs/superpowers/specs/2026-04-19-migracao-web-app-design.md`

**Source content (Python — reference only, do NOT modify):**
- `app/prompts/system_prompt.py` — 10 blocos de system prompt (~66KB)
- `app/services/mentor.py` — lógica de extração de perfil e resumos
- `app/services/supabase_service.py` — queries Supabase
- `sql/schema.sql` — schema atual

---

## Task 1: Scaffold Next.js + Configuração Base

**Files:**
- Create: `web/` (novo diretório para o web app — mantém Python intacto)
- Create: `web/package.json`
- Create: `web/tsconfig.json`
- Create: `web/next.config.ts`
- Create: `web/tailwind.config.ts`
- Create: `web/src/app/globals.css`
- Create: `web/src/app/layout.tsx`
- Create: `web/src/app/page.tsx`
- Create: `web/src/lib/utils.ts`
- Create: `web/.env.local.example`

- [ ] **Step 1: Criar diretório e inicializar Next.js**

```bash
cd /Users/kapi/mentor_empreendedor
mkdir web && cd web
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk
npx shadcn@latest init -y
```

Durante o init do shadcn, escolher: New York style, Zinc base color, CSS variables.

- [ ] **Step 3: Instalar componentes shadcn necessários**

```bash
npx shadcn@latest add button input label textarea card badge dialog alert-dialog select separator avatar scroll-area sheet dropdown-menu skeleton sonner switch
```

- [ ] **Step 4: Criar `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

- [ ] **Step 5: Configurar `@custom-variant dark` no globals.css**

Adicionar no topo do `globals.css`:
```css
@custom-variant dark (&:where(.dark, .dark *));
```

- [ ] **Step 6: Configurar root layout com fontes e ThemeProvider**

`web/src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mentor Empreendedor | Max Impulso',
  description: 'Seu mentor virtual de negócios para microempreendedores brasileiros',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Criar página raiz temporária**

`web/src/app/page.tsx`:
```tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-dvh">
      <h1 className="text-2xl font-bold">Mentor Empreendedor</h1>
    </div>
  )
}
```

- [ ] **Step 8: Verificar que funciona**

```bash
cd /Users/kapi/mentor_empreendedor/web
npm run build
npm run dev
```

Abrir http://localhost:3000 — deve mostrar "Mentor Empreendedor".

- [ ] **Step 9: Commit**

```bash
git add web/
git commit -m "feat: scaffold Next.js 16 + Tailwind + shadcn/ui"
```

---

## Task 2: Supabase Auth + Middleware

**Files:**
- Create: `web/src/lib/supabase/client.ts`
- Create: `web/src/lib/supabase/server.ts`
- Create: `web/src/lib/supabase/middleware.ts`
- Create: `web/src/middleware.ts`
- Create: `web/src/app/(auth)/layout.tsx`
- Create: `web/src/app/(auth)/login/page.tsx`
- Create: `web/src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Criar Supabase browser client**

`web/src/lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (client) return client
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return client
}
```

- [ ] **Step 2: Criar Supabase server client**

`web/src/lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )
}
```

- [ ] **Step 3: Criar middleware helper**

`web/src/lib/supabase/middleware.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && !path.startsWith('/login') && !path.startsWith('/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (path === '/login' || path === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

- [ ] **Step 4: Criar middleware**

`web/src/middleware.ts`:
```ts
import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
```

- [ ] **Step 5: Criar layout de auth**

`web/src/app/(auth)/layout.tsx`:
```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center text-white font-bold text-xl">M</div>
          <h1 className="text-2xl font-bold">Max Impulso</h1>
          <p className="text-sm text-muted-foreground">Seu mentor virtual de negócios</p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Criar página de login**

`web/src/app/(auth)/login/page.tsx` — formulário com email + senha, link para registro, submit via Supabase `signInWithPassword`, redirect para `/` no sucesso. Inline validation com `border-destructive`. Botão com loading spinner.

- [ ] **Step 7: Criar página de registro**

`web/src/app/(auth)/register/page.tsx` — formulário com email + senha + confirmar senha, link para login, submit via Supabase `signUp`, redirect para `/onboarding` no sucesso. Mesmos padrões de validação.

- [ ] **Step 8: Verificar fluxo**

```bash
npm run build
```

Deve compilar sem erros. Login e registro funcionais (requer .env.local com Supabase vars preenchidas).

- [ ] **Step 9: Commit**

```bash
git add web/src/lib/supabase/ web/src/middleware.ts web/src/app/\(auth\)/
git commit -m "feat: Supabase Auth + middleware + login/register"
```

---

## Task 3: Schema do Banco + Types TypeScript

**Files:**
- Create: `web/sql/migration-web.sql`
- Create: `web/src/types/database.ts`

- [ ] **Step 1: Criar migration SQL**

`web/sql/migration-web.sql`:
```sql
-- Adaptar tabela users: phone → email
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS skipped_onboarding BOOLEAN DEFAULT false;

-- Criar tabela conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nova conversa',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Trigger para updated_at (reutiliza function existente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at'
  ) THEN
    CREATE TRIGGER update_conversations_updated_at
      BEFORE UPDATE ON conversations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Adaptar messages: adicionar conversation_id
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Adaptar conversation_summaries: adicionar conversation_id
ALTER TABLE conversation_summaries
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- RLS policies para conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid()::text = user_id::text);
```

- [ ] **Step 2: Executar migration**

```bash
npx supabase db query --linked < web/sql/migration-web.sql
```

Verificar que as tabelas e colunas foram criadas sem erro.

- [ ] **Step 3: Criar tipos TypeScript**

`web/src/types/database.ts`:
```ts
export interface User {
  id: string
  email: string | null
  name: string | null
  setor: string | null
  estagio: string | null
  tempo_negocio: string | null
  faturamento: string | null
  tempo_negocio_meses: number | null
  faturamento_mensal: number | null
  desafio_principal: string | null
  is_onboarded: boolean
  skipped_onboarding: boolean
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  user_id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ConversationSummary {
  id: string
  conversation_id: string
  summary: string
  messages_covered: number
  created_at: string
  updated_at: string
}
```

- [ ] **Step 4: Commit**

```bash
git add web/sql/ web/src/types/
git commit -m "feat: migration SQL + tipos TypeScript"
```

---

## Task 4: System Prompt — Portar de Python para TypeScript

**Files:**
- Create: `web/src/lib/prompts/identidade.ts`
- Create: `web/src/lib/prompts/conhecimento.ts`
- Create: `web/src/lib/prompts/livros.ts`
- Create: `web/src/lib/prompts/regras.ts`
- Create: `web/src/lib/prompts/personalizacao.ts`
- Create: `web/src/lib/prompts/conflitos.ts`
- Create: `web/src/lib/prompts/nichos.ts`
- Create: `web/src/lib/prompts/institucional.ts`
- Create: `web/src/lib/prompts/impulso-stone.ts`
- Create: `web/src/lib/prompts/diagnostico.ts`
- Create: `web/src/lib/prompts/atualizacao-perfil.ts`
- Create: `web/src/lib/prompts/index.ts`

- [ ] **Step 1: Portar cada bloco de `app/prompts/system_prompt.py`**

Cada bloco Python vira um arquivo TypeScript exportando uma `const string`. O conteúdo é **idêntico** — copiar texto literal, apenas mudar o formato de Python triple-quoted string para TypeScript template literal.

Exemplo para `identidade.ts`:
```ts
export const IDENTIDADE_E_TOM = `Voce e o Max Impulso, um assistente virtual...`
```

Repetir para todos os 11 blocos. O conteúdo NÃO deve ser modificado — é IP do projeto.

- [ ] **Step 2: Criar `buildSystemPrompt()` em `index.ts`**

`web/src/lib/prompts/index.ts`:
```ts
import type { User } from '@/types/database'
import { IDENTIDADE_E_TOM } from './identidade'
import { BASE_CONHECIMENTO } from './conhecimento'
import { BASE_LIVROS } from './livros'
import { REGRAS_INTERACAO } from './regras'
import { PERSONALIZACAO_ESTAGIO } from './personalizacao'
import { RESOLUCAO_CONFLITOS } from './conflitos'
import { REFERENCIAS_NICHO } from './nichos'
import { BASE_INSTITUCIONAL } from './institucional'
import { BASE_IMPULSO_STONE } from './impulso-stone'
import { INSTRUCOES_DIAGNOSTICO } from './diagnostico'
import { INSTRUCOES_ATUALIZACAO_PERFIL } from './atualizacao-perfil'

export function buildSystemPrompt(user: User | null, summary?: string | null): string {
  const blocks: string[] = [
    IDENTIDADE_E_TOM,
    BASE_CONHECIMENTO,
    BASE_LIVROS,
    REGRAS_INTERACAO,
    PERSONALIZACAO_ESTAGIO,
    RESOLUCAO_CONFLITOS,
    REFERENCIAS_NICHO,
    BASE_INSTITUCIONAL,
    BASE_IMPULSO_STONE,
  ]

  if (user?.is_onboarded) {
    const contexto = `CONTEXTO DO USUARIO ATUAL:
- Nome: ${user.name || 'empreendedor'}
- Setor: ${user.setor || 'nao informado'}
- Estagio: ${user.estagio || 'iniciante'}
- Tempo de negocio: ${user.tempo_negocio || 'nao informado'}
- Faturamento: ${user.faturamento || 'nao informado'}
- Desafio principal: ${user.desafio_principal || 'nao informado'}

O usuario ja completou o diagnostico. Personalize suas respostas para o estagio "${user.estagio || 'iniciante'}" e o setor "${user.setor || 'nao informado'}".`
    blocks.push(contexto)
    blocks.push(INSTRUCOES_ATUALIZACAO_PERFIL)
  } else {
    blocks.push(INSTRUCOES_DIAGNOSTICO)
  }

  if (summary) {
    blocks.push(`HISTORICO RESUMIDO DAS CONVERSAS ANTERIORES:
${summary}

Use este historico para dar continuidade ao acompanhamento. NAO repita conselhos ja dados. Acompanhe o progresso do usuario e retome pendencias quando relevante.`)
  }

  return blocks.join('\n\n---\n\n')
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/prompts/
git commit -m "feat: system prompt portado de Python para TypeScript (11 blocos)"
```

---

## Task 5: Profile Extractor + Summary Generator

**Files:**
- Create: `web/src/lib/profile-extractor.ts`
- Create: `web/src/lib/summary.ts`

- [ ] **Step 1: Portar profile-extractor.ts de mentor.py**

`web/src/lib/profile-extractor.ts` — portar as funções `extractProfile`, `extractProfileUpdate`, `parseTempoMeses`, `parseFaturamento`, `cleanResponse`, `standardizeProfileFields` de `/Users/kapi/mentor_empreendedor/app/services/mentor.py`. Mesma lógica regex, em TypeScript.

- [ ] **Step 2: Portar summary.ts de mentor.py**

`web/src/lib/summary.ts` — portar `generateConversationSummary()`. Usa `@anthropic-ai/sdk` em vez do SDK Python. Mesma prompt de resumo (5 seções, max 800 palavras).

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/profile-extractor.ts web/src/lib/summary.ts
git commit -m "feat: profile extractor + summary generator portados de Python"
```

---

## Task 6: API Route de Chat (Streaming)

**Files:**
- Create: `web/src/app/api/chat/route.ts`

- [ ] **Step 1: Criar API route com streaming**

`web/src/app/api/chat/route.ts`:
```ts
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/prompts'
import { extractProfile, extractProfileUpdate, cleanResponse, standardizeProfileFields } from '@/lib/profile-extractor'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return new Response('Unauthorized', { status: 401 })

  const { conversationId, message } = await request.json()
  if (!conversationId || !message) return new Response('Bad request', { status: 400 })

  // Load user profile
  const { data: profile } = await supabase
    .from('users').select('*').eq('id', authUser.id).single()

  // Load conversation history (last 100)
  const { data: history } = await supabase
    .from('messages').select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100)

  // Load summary
  const { data: summaryRow } = await supabase
    .from('conversation_summaries').select('summary')
    .eq('conversation_id', conversationId).single()

  const systemPrompt = buildSystemPrompt(profile, summaryRow?.summary)
  const messages = [
    ...(history || []).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ]

  // Save user message
  await supabase.from('messages').insert({
    user_id: authUser.id,
    conversation_id: conversationId,
    role: 'user',
    content: message,
  })

  // Stream from Claude
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    messages,
  })

  let fullText = ''

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const text = event.delta.text
          fullText += text
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
      }

      // Stream done — post-processing
      const cleaned = cleanResponse(fullText)
      const profileData = extractProfile(fullText)
      const profileUpdate = extractProfileUpdate(fullText)

      let mergedProfile: Record<string, unknown> | null = null
      if (profileData || profileUpdate) {
        mergedProfile = { ...profileData, ...profileUpdate }
        mergedProfile = standardizeProfileFields(mergedProfile)
      }

      // Save assistant message (cleaned)
      await supabase.from('messages').insert({
        user_id: authUser.id,
        conversation_id: conversationId,
        role: 'assistant',
        content: cleaned,
      })

      // Update profile if extracted
      if (mergedProfile) {
        await supabase.from('users')
          .update({ ...mergedProfile, is_onboarded: true })
          .eq('id', authUser.id)
      }

      // Send done signal with metadata
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        done: true,
        profileUpdated: !!mergedProfile,
      })}\n\n`))
      controller.close()
    },
  })

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/api/chat/
git commit -m "feat: API route de chat com streaming Claude SSE"
```

---

## Task 7: API Routes de Conversas

**Files:**
- Create: `web/src/app/api/conversations/route.ts`
- Create: `web/src/app/api/conversations/[id]/route.ts`
- Create: `web/src/app/api/conversations/[id]/title/route.ts`

- [ ] **Step 1: CRUD de conversas**

`web/src/app/api/conversations/route.ts`:
- `GET` → lista conversas do usuário autenticado, ordenadas por `updated_at desc`
- `POST` → cria nova conversa, retorna `{ id, title }`

- [ ] **Step 2: Delete conversa**

`web/src/app/api/conversations/[id]/route.ts`:
- `DELETE` → deleta conversa (cascade deleta messages e summary)

- [ ] **Step 3: Gerar título**

`web/src/app/api/conversations/[id]/title/route.ts`:
- `PATCH` → recebe `{ firstMessage }`, chama Claude Haiku para gerar título de 3-5 palavras, atualiza conversa

- [ ] **Step 4: Commit**

```bash
git add web/src/app/api/conversations/
git commit -m "feat: API routes CRUD conversas + geração de título"
```

---

## Task 8: Hooks — useChat + useConversations

**Files:**
- Create: `web/src/hooks/use-chat.ts`
- Create: `web/src/hooks/use-conversations.ts`

- [ ] **Step 1: Hook useChat**

`web/src/hooks/use-chat.ts` — gerencia estado do chat:
- `messages: Message[]` — lista de mensagens da conversa
- `isStreaming: boolean` — indica se está recebendo streaming
- `streamingText: string` — texto parcial do streaming
- `sendMessage(text)` — POST `/api/chat`, processa SSE, acumula tokens
- `loadMessages(conversationId)` — carrega mensagens do Supabase

- [ ] **Step 2: Hook useConversations**

`web/src/hooks/use-conversations.ts` — CRUD de conversas:
- `conversations: Conversation[]`
- `loadConversations()` — GET `/api/conversations`
- `createConversation()` — POST → retorna nova conversa
- `deleteConversation(id)` — DELETE

- [ ] **Step 3: Commit**

```bash
git add web/src/hooks/
git commit -m "feat: hooks useChat (streaming) + useConversations"
```

---

## Task 9: Componentes de Chat

**Files:**
- Create: `web/src/components/chat/message-list.tsx`
- Create: `web/src/components/chat/message-bubble.tsx`
- Create: `web/src/components/chat/chat-input.tsx`
- Create: `web/src/components/chat/streaming-message.tsx`

- [ ] **Step 1: MessageBubble**

Layout minimalista: avatar pequeno (M verde para Max, inicial do usuário em azul), bolha com `max-w-[720px]`, `rounded-2xl`, cores diferenciadas user/assistant. Suporta markdown básico (parágrafos, bold, listas).

- [ ] **Step 2: StreamingMessage**

Componente que renderiza `streamingText` com cursor piscante no final. Quando streaming termina, desaparece e a mensagem normal aparece.

- [ ] **Step 3: MessageList**

ScrollArea com auto-scroll para o final quando nova mensagem chega. Renderiza array de `MessageBubble` + `StreamingMessage` condicional.

- [ ] **Step 4: ChatInput**

Textarea auto-resize + botão enviar. Submit via Enter (Shift+Enter para nova linha). Desabilitado durante streaming. Placeholder "O que você gostaria de saber?".

- [ ] **Step 5: Commit**

```bash
git add web/src/components/chat/
git commit -m "feat: componentes de chat (bubble, list, input, streaming)"
```

---

## Task 10: Sidebar de Conversas

**Files:**
- Create: `web/src/components/sidebar/conversation-list.tsx`
- Create: `web/src/components/sidebar/conversation-item.tsx`

- [ ] **Step 1: ConversationItem**

Item clicável com título truncado + data relativa (`date-fns`). Botão delete (Trash2 icon, `aria-label="Excluir conversa"`). Highlight quando ativo. Hover state.

- [ ] **Step 2: ConversationList**

Lista de conversas + botão "Nova conversa" no topo (com ícone Plus). ScrollArea. No mobile, renderiza dentro de um Sheet.

- [ ] **Step 3: Commit**

```bash
git add web/src/components/sidebar/
git commit -m "feat: sidebar de conversas (list + item)"
```

---

## Task 11: Layout do Chat + Páginas

**Files:**
- Create: `web/src/app/(chat)/layout.tsx`
- Create: `web/src/app/(chat)/page.tsx`
- Create: `web/src/app/(chat)/c/[id]/page.tsx`

- [ ] **Step 1: Layout do chat**

`web/src/app/(chat)/layout.tsx`:
- Desktop: sidebar fixa à esquerda (w-72) + área de chat
- Mobile: sidebar como Sheet (hamburger no header)
- Header: avatar Max + "Max Impulso" + ícones perfil/settings
- Dark/light via ThemeProvider (criar `web/src/components/theme-provider.tsx` e `theme-toggle.tsx`)

- [ ] **Step 2: Página raiz**

`web/src/app/(chat)/page.tsx`:
- Se há conversas → redirect para a mais recente
- Se não → cria nova conversa e redirect

- [ ] **Step 3: Página de conversa**

`web/src/app/(chat)/c/[id]/page.tsx`:
- Carrega mensagens do Supabase (server component)
- Renderiza `MessageList` + `ChatInput` (client boundary)
- Integra `useChat` hook para streaming

- [ ] **Step 4: Commit**

```bash
git add web/src/app/\(chat\)/ web/src/components/theme-provider.tsx web/src/components/theme-toggle.tsx
git commit -m "feat: layout do chat + páginas de conversa"
```

---

## Task 12: Onboarding + Perfil + Settings

**Files:**
- Create: `web/src/app/onboarding/page.tsx`
- Create: `web/src/components/onboarding/onboarding-form.tsx`
- Create: `web/src/app/profile/page.tsx`
- Create: `web/src/components/profile/profile-form.tsx`
- Create: `web/src/app/settings/page.tsx`

- [ ] **Step 1: Onboarding**

`web/src/app/onboarding/page.tsx`:
- Formulário: nome, setor, tempo de negócio, faturamento mensal, desafio principal
- Dois botões: "Salvar e conversar" (`is_onboarded=true`, `skipped_onboarding=false`) e "Pular" (`skipped_onboarding=true`)
- Ambos redirecionam para `/`

- [ ] **Step 2: Perfil**

`web/src/app/profile/page.tsx`:
- Card com dados atuais, campos editáveis
- Salvar → atualiza Supabase
- Link para voltar ao chat

- [ ] **Step 3: Settings**

`web/src/app/settings/page.tsx`:
- Toggle tema (claro/escuro/sistema)
- Trocar senha (Supabase `updateUser`)
- Excluir conta (AlertDialog → delete user cascade)

- [ ] **Step 4: Commit**

```bash
git add web/src/app/onboarding/ web/src/app/profile/ web/src/app/settings/ web/src/components/onboarding/ web/src/components/profile/
git commit -m "feat: onboarding opcional + perfil editável + settings"
```

---

## Task 13: Summary Background + Title Generation

**Files:**
- Modify: `web/src/app/api/chat/route.ts` (adicionar trigger de summary)

- [ ] **Step 1: Adicionar geração de summary no fim do stream**

No `route.ts` de chat, após salvar a mensagem do assistant:
- Contar mensagens da conversa
- Se `count % 20 === 0` → chamar `generateConversationSummary()` e upsert no Supabase
- Se é a primeira mensagem da conversa → chamar API de título (`PATCH /api/conversations/[id]/title`)
- Ambas chamadas são fire-and-forget (não bloqueiam o SSE done signal)

- [ ] **Step 2: Commit**

```bash
git add web/src/app/api/chat/route.ts
git commit -m "feat: summary automático a cada 20 msgs + título na 1ª msg"
```

---

## Task 14: Dark Mode + Theme Provider

**Files:**
- Create: `web/src/components/theme-provider.tsx`
- Create: `web/src/components/theme-toggle.tsx`
- Modify: `web/src/app/layout.tsx`

- [ ] **Step 1: ThemeProvider**

Implementar ThemeProvider com localStorage persistence e `matchMedia` listener para tema "sistema". Seguir padrão do ManutSASIT.

- [ ] **Step 2: ThemeToggle**

Dropdown com 3 opções: Claro (Sun), Escuro (Moon), Sistema (Monitor). Usar DropdownMenu do shadcn.

- [ ] **Step 3: Integrar no root layout**

Adicionar `<ThemeProvider>` no root layout. `suppressHydrationWarning` no `<html>`.

- [ ] **Step 4: Commit**

```bash
git add web/src/components/theme-provider.tsx web/src/components/theme-toggle.tsx web/src/app/layout.tsx
git commit -m "feat: dark mode com ThemeProvider + toggle"
```

---

## Task 15: Signout + Verificação Final

**Files:**
- Create: `web/src/app/api/auth/signout/route.ts`

- [ ] **Step 1: API route de signout**

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
}
```

- [ ] **Step 2: Build completo**

```bash
cd /Users/kapi/mentor_empreendedor/web
npm run build
```

Zero errors.

- [ ] **Step 3: Teste manual completo**

```bash
npm run dev
```

Verificar:
1. Registro → onboarding → preencher ou pular → chat
2. Nova conversa → enviar mensagem → streaming funciona
3. Múltiplas conversas → sidebar mostra lista
4. Título gerado automaticamente
5. Perfil extraído pela IA (verificar no Supabase)
6. Editar perfil manualmente
7. Dark mode toggle
8. Logout → redirect para login
9. Mobile responsivo (375px)

- [ ] **Step 4: Deploy Vercel**

```bash
cd /Users/kapi/mentor_empreendedor/web
vercel --prod
```

Configurar env vars no Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`.

- [ ] **Step 5: Commit final**

```bash
git add .
git commit -m "feat: Mentor Empreendedor web app completo — migração de WhatsApp para Next.js"
```

---

## Verificação Pós-Deploy

1. Acessar URL de produção
2. Registrar novo usuário
3. Completar onboarding
4. Enviar mensagem e verificar streaming
5. Verificar extração de perfil no Supabase
6. Criar segunda conversa
7. Testar em mobile
8. Testar dark mode
9. Logout e login novamente — conversas preservadas
