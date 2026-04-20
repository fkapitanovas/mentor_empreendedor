# Design Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign completo do Max Impulso com direção "Tropical & Vibrante" — paleta emerald/amber, Plus Jakarta Sans + DM Sans, dark mode neutro.

**Architecture:** Mudanças puramente visuais — CSS variables, classes Tailwind, e componentes React. Nenhuma alteração em lógica de negócio, APIs, ou banco de dados. Todas as interfaces mantêm os mesmos props/contratos.

**Tech Stack:** Next.js 16, Tailwind CSS v4, shadcn/ui, next/font/google (Plus Jakarta Sans, DM Sans), Lucide React

**Spec:** `docs/superpowers/specs/2026-04-20-design-overhaul-design.md`

---

## File Map

### Modified Files
| File | Responsibility |
|------|---------------|
| `web/src/app/layout.tsx` | Root layout — font loading |
| `web/src/app/globals.css` | CSS variables, theme, animations |
| `web/src/app/(chat)/layout.tsx` | Chat header + sidebar shell |
| `web/src/app/(chat)/c/[id]/page.tsx` | Conversation page — pass onSend to MessageList |
| `web/src/app/(auth)/layout.tsx` | Auth layout — dot grid, branding |
| `web/src/app/(auth)/login/page.tsx` | Login form — icons, styling |
| `web/src/app/(auth)/register/page.tsx` | Register form |
| `web/src/app/(auth)/forgot-password/page.tsx` | Forgot password form |
| `web/src/app/(auth)/reset-password/page.tsx` | Reset password form |
| `web/src/app/onboarding/page.tsx` | Onboarding — icons, progress bar |
| `web/src/app/profile/page.tsx` | Profile — colored badges |
| `web/src/app/settings/page.tsx` | Settings — segmented theme control |
| `web/src/components/chat/message-bubble.tsx` | Message bubble styling + markdown |
| `web/src/components/chat/message-list.tsx` | Empty state + suggestion chips |
| `web/src/components/chat/chat-input.tsx` | Input area styling |
| `web/src/components/chat/streaming-message.tsx` | Streaming bubble styling |
| `web/src/components/chat/typing-indicator.tsx` | Typing dots in bubble |
| `web/src/components/sidebar/conversation-list.tsx` | Sidebar list + new conversation button |
| `web/src/components/sidebar/conversation-item.tsx` | Conversation item styling |
| `web/src/components/theme-toggle.tsx` | Segmented control replacement |

---

### Task 1: Foundation — Fonts & CSS Variables

**Files:**
- Modify: `web/src/app/layout.tsx`
- Modify: `web/src/app/globals.css`

- [ ] **Step 1: Replace fonts in layout.tsx**

Replace Geist imports with Plus Jakarta Sans and DM Sans:

```tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Mentor Empreendedor | Max Impulso",
  description: "Seu mentor virtual de negócios para microempreendedores brasileiros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${jakarta.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace globals.css with new theme**

Replace the entire globals.css with the new color system, font mappings, and animations:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-body);
  --font-heading: var(--font-display);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}

:root {
  --background: #FFFDF7;
  --foreground: #1A1A17;
  --card: #FFFFFF;
  --card-foreground: #1A1A17;
  --popover: #FFFFFF;
  --popover-foreground: #1A1A17;
  --primary: #059669;
  --primary-foreground: #FFFFFF;
  --secondary: #F0FDF4;
  --secondary-foreground: #1A1A17;
  --muted: #F5F3EE;
  --muted-foreground: #78716C;
  --accent: #F59E0B;
  --accent-foreground: #78350F;
  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;
  --border: #E7E5DF;
  --input: #E7E5DF;
  --ring: #059669;
  --chart-1: #059669;
  --chart-2: #0D9488;
  --chart-3: #F59E0B;
  --chart-4: #10B981;
  --chart-5: #14B8A6;
  --radius: 0.75rem;
  --sidebar: #F5F3EE;
  --sidebar-foreground: #1A1A17;
  --sidebar-primary: #059669;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #FFFFFF;
  --sidebar-accent-foreground: #1A1A17;
  --sidebar-border: #E7E5DF;
  --sidebar-ring: #059669;
}

.dark {
  --background: #111111;
  --foreground: #E5E7EB;
  --card: #161616;
  --card-foreground: #E5E7EB;
  --popover: #161616;
  --popover-foreground: #E5E7EB;
  --primary: #10B981;
  --primary-foreground: #FFFFFF;
  --secondary: #1A2E1F;
  --secondary-foreground: #D1FAE5;
  --muted: #1A1A1A;
  --muted-foreground: #9CA3AF;
  --accent: #F59E0B;
  --accent-foreground: #78350F;
  --destructive: #DC2626;
  --destructive-foreground: #FFFFFF;
  --border: rgba(255,255,255,0.08);
  --input: rgba(255,255,255,0.08);
  --ring: #10B981;
  --chart-1: #10B981;
  --chart-2: #14B8A6;
  --chart-3: #F59E0B;
  --chart-4: #34D399;
  --chart-5: #2DD4BF;
  --sidebar: #1A1A1A;
  --sidebar-foreground: #E5E7EB;
  --sidebar-primary: #10B981;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #222222;
  --sidebar-accent-foreground: #E5E7EB;
  --sidebar-border: rgba(255,255,255,0.08);
  --sidebar-ring: #10B981;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
}

/* Custom animations */
@keyframes message-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.animate-message-in {
  animation: message-in 200ms ease-out;
}

.animate-cursor-blink {
  animation: cursor-blink 1s ease-in-out infinite;
}
```

- [ ] **Step 3: Verify foundation**

Run: `cd web && npm run build`
Expected: Build succeeds. Fonts load, colors change throughout app.

- [ ] **Step 4: Commit**

```bash
git add web/src/app/layout.tsx web/src/app/globals.css
git commit -m "style: replace theme foundation — Jakarta+DM Sans, emerald/amber palette"
```

---

### Task 2: Chat Layout — Header & Sidebar

**Files:**
- Modify: `web/src/app/(chat)/layout.tsx`
- Modify: `web/src/components/sidebar/conversation-list.tsx`
- Modify: `web/src/components/sidebar/conversation-item.tsx`

- [ ] **Step 1: Redesign chat layout header and sidebar shell**

Replace `web/src/app/(chat)/layout.tsx` with new header (h-14, shadow, font-heading for brand) and sidebar (bg-muted):

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, LogOut, User, Settings, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { ConversationList } from '@/components/sidebar/conversation-list'
import { useConversations } from '@/hooks/use-conversations'
import { createClient } from '@/lib/supabase/client'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { conversations, loading, loadConversations, createConversation, deleteConversation } =
    useConversations()
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeId = pathname.startsWith('/c/') ? pathname.split('/c/')[1] : null

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleNew = useCallback(async () => {
    const conv = await createConversation()
    setSheetOpen(false)
    router.push(`/c/${conv.id}`)
  }, [createConversation, router])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id)
      if (activeId === id) {
        if (conversations.length > 1) {
          const next = conversations.find((c) => c.id !== id)
          if (next) router.push(`/c/${next.id}`)
          else router.push('/')
        } else {
          router.push('/')
        }
      }
    },
    [deleteConversation, activeId, conversations, router]
  )

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  const sidebarContent = (
    <ConversationList
      conversations={conversations}
      activeId={activeId}
      onNew={handleNew}
      onDelete={handleDelete}
      onNavigate={() => setSheetOpen(false)}
      loading={loading}
    />
  )

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between px-4" style={{ boxShadow: '0 1px 0 var(--border)' }}>
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu de conversas</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
            M
          </div>
          <span className="font-heading text-base font-bold text-primary">Max Impulso</span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Menu do usuario" />
              }
            >
              <User className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href="/profile" />}
              >
                <UserCircle className="size-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/settings" />}
              >
                <Settings className="size-4" />
                Configuracoes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 bg-muted md:block" style={{ boxShadow: '1px 0 0 var(--border)' }}>
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Redesign conversation list with prominent new-chat button**

Replace `web/src/components/sidebar/conversation-list.tsx`:

```tsx
'use client'

import { Plus, MessageSquare } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ConversationItem } from './conversation-item'
import type { Conversation } from '@/types/database'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onNew: () => void
  onDelete: (id: string) => void
  onNavigate?: () => void
  loading: boolean
}

export function ConversationList({
  conversations,
  activeId,
  onNew,
  onDelete,
  onNavigate,
  loading,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          onClick={onNew}
          className="w-full justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 font-heading text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-800"
          size="lg"
        >
          <Plus className="size-4" />
          Nova conversa
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3 pb-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <MessageSquare className="size-8 opacity-40" />
            <p>Nenhuma conversa ainda</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onDelete={onDelete}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
```

- [ ] **Step 3: Redesign conversation item with active border-left**

Replace `web/src/components/sidebar/conversation-item.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/types/database'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onDelete: (id: string) => void
  onNavigate?: () => void
}

export function ConversationItem({
  conversation,
  isActive,
  onDelete,
  onNavigate,
}: ConversationItemProps) {
  return (
    <Link
      href={`/c/${conversation.id}`}
      onClick={onNavigate}
      className={cn(
        'group flex items-center gap-2 rounded-xl px-3 py-3 text-sm transition-all duration-150',
        isActive
          ? 'border-l-3 border-primary bg-background font-medium'
          : 'hover:bg-background'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate">{conversation.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(conversation.updated_at || conversation.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(conversation.id)
        }}
        aria-label="Excluir conversa"
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </Button>
    </Link>
  )
}
```

- [ ] **Step 4: Verify visually**

Run: `cd web && npm run dev`
Check: header taller (56px), brand name in green Jakarta font, sidebar has gradient button, active item has green left border.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/\(chat\)/layout.tsx web/src/components/sidebar/conversation-list.tsx web/src/components/sidebar/conversation-item.tsx
git commit -m "style: redesign chat header and sidebar — taller header, gradient CTA, active border"
```

---

### Task 3: Chat Components — Message Bubbles

**Files:**
- Modify: `web/src/components/chat/message-bubble.tsx`
- Modify: `web/src/components/chat/streaming-message.tsx`
- Modify: `web/src/components/chat/typing-indicator.tsx`

- [ ] **Step 1: Redesign message bubble with asymmetric corners and heading support**

Replace `web/src/components/chat/message-bubble.tsx`:

```tsx
'use client'

import { cn } from '@/lib/utils'
import type { Message } from '@/types/database'

function formatContent(content: string, isAssistant: boolean) {
  return content.split('\n\n').map((paragraph, i) => {
    const trimmed = paragraph.trim()

    // Handle headings (### Heading)
    if (isAssistant && trimmed.startsWith('### ')) {
      return (
        <p key={i} className={cn('font-heading text-[15px] font-semibold', i > 0 && 'mt-4')}>
          {renderInline(trimmed.slice(4), isAssistant)}
        </p>
      )
    }

    const lines = trimmed.split('\n')
    return (
      <p key={i} className={i > 0 ? 'mt-3' : undefined}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {renderInline(line, isAssistant)}
          </span>
        ))}
      </p>
    )
  })
}

function renderInline(text: string, isAssistant: boolean) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={isAssistant ? 'font-semibold text-primary' : 'font-semibold'}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-2 animate-message-in',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
          M
        </div>
      )}
      <div
        className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'max-w-[min(720px,85%)] rounded-tl-md border border-border bg-secondary text-secondary-foreground'
            : 'max-w-[min(480px,75%)] rounded-tr-md bg-gradient-to-br from-emerald-600 to-teal-600 text-white'
        )}
        style={{ lineHeight: '1.7' }}
      >
        {formatContent(message.content, isAssistant)}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Redesign streaming message to match new bubble style**

Replace `web/src/components/chat/streaming-message.tsx`:

```tsx
'use client'

interface StreamingMessageProps {
  text: string
}

export function StreamingMessage({ text }: StreamingMessageProps) {
  const paragraphs = text.split('\n\n')

  return (
    <div className="flex gap-3 px-4 py-2 justify-start animate-message-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
        M
      </div>
      <div className="max-w-[min(720px,85%)] rounded-2xl rounded-tl-md border border-border bg-secondary px-4 py-3 text-sm text-secondary-foreground" style={{ lineHeight: '1.7' }}>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : undefined}>
            {paragraph}
          </p>
        ))}
        <span className="ml-0.5 inline-block animate-cursor-blink">|</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Redesign typing indicator inside bubble with avatar**

Replace `web/src/components/chat/typing-indicator.tsx`:

```tsx
'use client'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-2 justify-start animate-message-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
        M
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border bg-secondary px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary/40 [animation-delay:300ms]" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify visually**

Check: assistant bubbles green-tinted with top-left flat corner, user bubbles emerald gradient with top-right flat corner, bold text in primary color, typing dots inside bubble.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/chat/message-bubble.tsx web/src/components/chat/streaming-message.tsx web/src/components/chat/typing-indicator.tsx
git commit -m "style: redesign message bubbles — asymmetric corners, gradient user bubbles, heading support"
```

---

### Task 4: Chat Input & Empty State with Suggestions

**Files:**
- Modify: `web/src/components/chat/chat-input.tsx`
- Modify: `web/src/components/chat/message-list.tsx`
- Modify: `web/src/app/(chat)/c/[id]/page.tsx`

- [ ] **Step 1: Redesign chat input with floating shadow**

Replace `web/src/components/chat/chat-input.tsx`:

```tsx
'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleInput = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  return (
    <div className="bg-background px-4 py-3" style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.03)' }}>
      <div className="mx-auto flex max-w-[720px] items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            handleInput()
          }}
          onKeyDown={handleKeyDown}
          placeholder="O que voce gostaria de saber?"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-2xl border-[1.5px] border-input bg-card px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground transition-colors duration-150 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ touchAction: 'manipulation', minHeight: '44px' }}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white transition-all duration-150 hover:scale-105 hover:shadow-md hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-30"
          aria-label="Enviar mensagem"
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Redesign message list with suggestion chips in empty state**

Replace `web/src/components/chat/message-list.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { StreamingMessage } from './streaming-message'
import { TypingIndicator } from './typing-indicator'
import type { Message } from '@/types/database'

const SUGGESTIONS = [
  'Como precificar meu produto?',
  'Devo me formalizar como MEI?',
  'Como atrair mais clientes?',
]

interface MessageListProps {
  messages: Message[]
  streamingText: string
  isStreaming: boolean
  onSendSuggestion?: (text: string) => void
}

export function MessageList({ messages, streamingText, isStreaming, onSendSuggestion }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isStreaming])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white font-heading">
            M
          </div>
          <div>
            <h2 className="font-heading text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              Ola! Sou o Max Impulso
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Seu mentor de negocios
            </p>
          </div>
          {onSendSuggestion && (
            <div className="flex flex-col gap-2 mt-2 w-full max-w-sm">
              {SUGGESTIONS.map((text, i) => (
                <button
                  key={text}
                  onClick={() => onSendSuggestion(text)}
                  className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 text-left animate-message-in"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && streamingText && <StreamingMessage text={streamingText} />}
        {isStreaming && !streamingText && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
```

- [ ] **Step 3: Pass onSendSuggestion to MessageList in conversation page**

Replace `web/src/app/(chat)/c/[id]/page.tsx`:

```tsx
'use client'

import { useEffect, use } from 'react'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useChat } from '@/hooks/use-chat'

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { messages, isStreaming, streamingText, sendMessage, loadMessages } = useChat(id)

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList
        messages={messages}
        streamingText={streamingText}
        isStreaming={isStreaming}
        onSendSuggestion={sendMessage}
      />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
```

- [ ] **Step 4: Verify visually**

Check: input has rounded-2xl with no top border (shadow instead), send button is rounded-xl (not circle) with hover scale. Empty state shows "Max Impulso" with gradient text, 3 suggestion chips that send messages on click, staggered fade-in.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/chat/chat-input.tsx web/src/components/chat/message-list.tsx web/src/app/\(chat\)/c/\[id\]/page.tsx
git commit -m "style: redesign chat input and empty state — floating shadow, suggestion chips"
```

---

### Task 5: Auth Pages

**Files:**
- Modify: `web/src/app/(auth)/layout.tsx`
- Modify: `web/src/app/(auth)/login/page.tsx`
- Modify: `web/src/app/(auth)/register/page.tsx`
- Modify: `web/src/app/(auth)/forgot-password/page.tsx`
- Modify: `web/src/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Redesign auth layout with dot grid and improved branding**

Replace `web/src/app/(auth)/layout.tsx`:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xl font-bold text-white font-heading">
            M
          </div>
          <h1 className="font-heading text-xl font-bold text-primary">Max Impulso</h1>
          <p className="text-sm text-muted-foreground">
            Seu mentor virtual de negocios
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Redesign login page with icons in inputs**

Replace `web/src/app/(auth)/login/page.tsx`:

```tsx
'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/')
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="px-8 pt-8">
        <CardTitle className="text-center font-heading text-xl font-bold">Entrar</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-8">
          {urlError === 'invalid_link' && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              Link invalido ou expirado. Solicite um novo.
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="font-heading text-[13px] font-semibold">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-[1.5px] pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-heading text-[13px] font-semibold">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-[1.5px] pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[13px] text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-8 pb-8">
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 font-heading text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-800 transition-all duration-150 hover:shadow-md"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Nao tem conta?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
```

- [ ] **Step 3: Apply same styling to register page**

Apply identical pattern to `web/src/app/(auth)/register/page.tsx`: icons in inputs (Mail, Lock), rounded-2xl card with shadow-lg, px-8 padding, gradient submit button, AlertCircle error block, font-heading labels. Keep all existing logic (validation, success state) — only change styling classes and add icons.

- [ ] **Step 4: Apply same styling to forgot-password page**

Apply to `web/src/app/(auth)/forgot-password/page.tsx`: Mail icon in email input, same card/button/error styling. Success state: CheckCircle icon with `animate-message-in` animation.

- [ ] **Step 5: Apply same styling to reset-password page**

Apply to `web/src/app/(auth)/reset-password/page.tsx`: Lock icon in password inputs, same card/button/error styling. Success state with animation.

- [ ] **Step 6: Verify all auth pages**

Check each page (login, register, forgot-password, reset-password) in both light and dark mode. Verify dot grid background, icons in inputs, gradient buttons, error styling, success animations.

- [ ] **Step 7: Commit**

```bash
git add web/src/app/\(auth\)/
git commit -m "style: redesign auth pages — dot grid, icon inputs, gradient buttons, improved errors"
```

---

### Task 6: Onboarding Page

**Files:**
- Modify: `web/src/app/onboarding/page.tsx`

- [ ] **Step 1: Redesign onboarding with icons and progress indicator**

Replace `web/src/app/onboarding/page.tsx`:

```tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Briefcase, Clock, DollarSign, Target } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [setor, setSetor] = useState('')
  const [tempoNegocio, setTempoNegocio] = useState('')
  const [faturamento, setFaturamento] = useState('')
  const [desafio, setDesafio] = useState('')
  const [saving, setSaving] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const filledCount = useMemo(() => {
    return [nome, setor, tempoNegocio, faturamento, desafio].filter(Boolean).length
  }, [nome, setor, tempoNegocio, faturamento, desafio])

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      setUserId(session.user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('name, setor, tempo_negocio, faturamento, desafio_principal')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setNome(profile.name ?? '')
        setSetor(profile.setor ?? '')
        setTempoNegocio(profile.tempo_negocio ?? '')
        setFaturamento(profile.faturamento ?? '')
        setDesafio(profile.desafio_principal ?? '')
      }
    }

    loadUser()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)

    const supabase = createClient()
    await supabase
      .from('users')
      .update({
        name: nome || null,
        setor: setor || null,
        tempo_negocio: tempoNegocio || null,
        faturamento: faturamento || null,
        desafio_principal: desafio || null,
        is_onboarded: true,
        skipped_onboarding: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    router.push('/')
  }

  async function handleSkip() {
    if (!userId) return
    setSkipping(true)

    const supabase = createClient()
    await supabase
      .from('users')
      .update({
        skipped_onboarding: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    router.push('/')
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white font-heading">
            M
          </div>
        </div>

        <Card className="rounded-2xl shadow-lg overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-primary/20">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(filledCount / 5) * 100}%` }}
            />
          </div>

          <CardHeader className="px-8 pt-6">
            <CardTitle className="text-center font-heading text-xl font-bold">
              Conte um pouco sobre seu negocio
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Isso ajuda o Max a dar dicas mais certeiras. Pode pular se preferir.
            </p>
          </CardHeader>

          <form onSubmit={handleSave}>
            <CardContent className="space-y-4 px-8">
              <div className="space-y-2">
                <Label htmlFor="nome" className="font-heading text-[13px] font-semibold">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Como voce gostaria de ser chamado?"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="setor" className="font-heading text-[13px] font-semibold">Setor</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="setor"
                    type="text"
                    placeholder="Ex: Confeitaria, Estetica, Marketing Digital"
                    value={setor}
                    onChange={(e) => setSetor(e.target.value)}
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempoNegocio" className="font-heading text-[13px] font-semibold">Tempo de negocio</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="tempoNegocio"
                    type="text"
                    placeholder="Ex: 2 anos, 6 meses"
                    value={tempoNegocio}
                    onChange={(e) => setTempoNegocio(e.target.value)}
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faturamento" className="font-heading text-[13px] font-semibold">Faturamento mensal</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="faturamento"
                    type="text"
                    placeholder="Ex: R$ 5.000, 10mil"
                    value={faturamento}
                    onChange={(e) => setFaturamento(e.target.value)}
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desafio" className="font-heading text-[13px] font-semibold">Principal desafio</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Textarea
                    id="desafio"
                    placeholder="Ex: Precificacao, captar clientes, gestao financeira"
                    value={desafio}
                    onChange={(e) => setDesafio(e.target.value)}
                    className="min-h-[88px] rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex gap-3 px-8 pb-8">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl font-heading text-sm font-semibold"
                disabled={saving || skipping}
                onClick={handleSkip}
              >
                {skipping ? 'Redirecionando...' : 'Pular'}
              </Button>
              <Button
                type="submit"
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 font-heading text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-800"
                disabled={saving || skipping}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify visually**

Check: dot grid background, progress bar fills as fields are typed, icons in each input, gradient save button, side-by-side buttons.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/onboarding/page.tsx
git commit -m "style: redesign onboarding — icons, progress bar, dot grid background"
```

---

### Task 7: Profile & Settings Pages

**Files:**
- Modify: `web/src/app/profile/page.tsx`
- Modify: `web/src/app/settings/page.tsx`
- Modify: `web/src/components/theme-toggle.tsx`

- [ ] **Step 1: Redesign profile page with colored stage badges and icons**

Replace `web/src/app/profile/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, User, Briefcase, Clock, DollarSign, Target } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ESTAGIOS = [
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'em_crescimento', label: 'Em Crescimento' },
  { value: 'consolidado', label: 'Consolidado' },
]

const ESTAGIO_COLORS: Record<string, string> = {
  iniciante: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  em_crescimento: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  consolidado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function ProfilePage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [setor, setSetor] = useState('')
  const [estagio, setEstagio] = useState('')
  const [tempoNegocio, setTempoNegocio] = useState('')
  const [faturamento, setFaturamento] = useState('')
  const [desafio, setDesafio] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }

      setUserId(session.user.id)

      const { data: profile } = await supabase
        .from('users')
        .select('name, setor, estagio, tempo_negocio, faturamento, desafio_principal')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setNome(profile.name ?? '')
        setSetor(profile.setor ?? '')
        setEstagio(profile.estagio ?? '')
        setTempoNegocio(profile.tempo_negocio ?? '')
        setFaturamento(profile.faturamento ?? '')
        setDesafio(profile.desafio_principal ?? '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({
        name: nome || null,
        setor: setor || null,
        estagio: estagio || null,
        tempo_negocio: tempoNegocio || null,
        faturamento: faturamento || null,
        desafio_principal: desafio || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    setSaving(false)

    if (error) {
      toast.error('Erro ao salvar perfil. Tente novamente.')
    } else {
      toast.success('Perfil atualizado com sucesso')
    }
  }

  const estagioLabel = ESTAGIOS.find((e) => e.value === estagio)?.label

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <h1 className="mb-6 font-heading text-xl font-bold">Seu Perfil</h1>

      <Card className="rounded-2xl shadow-lg">
        <form onSubmit={handleSave}>
          <CardContent className="space-y-4 p-8">
            <div className="space-y-2">
              <Label htmlFor="nome" className="font-heading text-[13px] font-semibold">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="nome" type="text" placeholder="Como voce gostaria de ser chamado?" value={nome} onChange={(e) => setNome(e.target.value)} className="h-11 rounded-xl border-[1.5px] pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor" className="font-heading text-[13px] font-semibold">Setor</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="setor" type="text" placeholder="Ex: Confeitaria, Estetica, Marketing Digital" value={setor} onChange={(e) => setSetor(e.target.value)} className="h-11 rounded-xl border-[1.5px] pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-heading text-[13px] font-semibold">Estagio</Label>
              <div className="flex items-center gap-3">
                <Select value={estagio} onValueChange={(v) => setEstagio(v ?? '')}>
                  <SelectTrigger className="h-11 w-full rounded-xl border-[1.5px]">
                    <SelectValue placeholder="Selecionar estagio" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTAGIOS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {estagioLabel && estagio && (
                  <Badge className={`shrink-0 border-0 ${ESTAGIO_COLORS[estagio] || ''}`}>
                    {estagioLabel}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempoNegocio" className="font-heading text-[13px] font-semibold">Tempo de negocio</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="tempoNegocio" type="text" placeholder="Ex: 2 anos, 6 meses" value={tempoNegocio} onChange={(e) => setTempoNegocio(e.target.value)} className="h-11 rounded-xl border-[1.5px] pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faturamento" className="font-heading text-[13px] font-semibold">Faturamento mensal</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="faturamento" type="text" placeholder="Ex: R$ 5.000, 10mil" value={faturamento} onChange={(e) => setFaturamento(e.target.value)} className="h-11 rounded-xl border-[1.5px] pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desafio" className="font-heading text-[13px] font-semibold">Principal desafio</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Textarea id="desafio" placeholder="Ex: Precificacao, captar clientes, gestao financeira" value={desafio} onChange={(e) => setDesafio(e.target.value)} className="min-h-[88px] rounded-xl border-[1.5px] pl-10" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="px-8 pb-8">
            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 font-heading text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-800"
              disabled={saving}
            >
              <Save className="size-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create segmented theme control**

Replace `web/src/components/theme-toggle.tsx`:

```tsx
'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEMES = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Monitor },
] as const

export function ThemeToggle({ variant = 'icon' }: { variant?: 'icon' | 'segmented' }) {
  const { setTheme, theme } = useTheme()

  if (variant === 'segmented') {
    return (
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150',
              theme === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>
    )
  }

  // Icon-only variant for header
  return (
    <button
      onClick={() => {
        if (theme === 'light') setTheme('dark')
        else if (theme === 'dark') setTheme('system')
        else setTheme('light')
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Alternar tema"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </button>
  )
}
```

- [ ] **Step 3: Redesign settings page with segmented theme control**

Replace `web/src/app/settings/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Palette, Trash2, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function SettingsPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas nao coincidem.')
      return
    }

    setUpdatingPassword(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setUpdatingPassword(false)

    if (error) {
      setPasswordError('Erro ao atualizar senha. Tente novamente.')
    } else {
      toast.success('Senha atualizada com sucesso')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)

    const supabase = createClient()
    await supabase.auth.signOut()

    toast.info('Para excluir sua conta definitivamente, entre em contato com o suporte.')
    router.push('/login')
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <h1 className="mb-6 font-heading text-xl font-bold">Configuracoes</h1>

      <div className="space-y-4">
        {/* Aparencia */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold">
              <Palette className="size-4 text-primary" />
              Aparencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-xs text-muted-foreground">
                  Escolha entre claro, escuro ou sistema
                </p>
              </div>
              <ThemeToggle variant="segmented" />
            </div>
          </CardContent>
        </Card>

        {/* Seguranca */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold">
              <Shield className="size-4 text-primary" />
              Seguranca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="font-heading text-[13px] font-semibold">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-heading text-[13px] font-semibold">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {passwordError}
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 font-heading text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-800"
                disabled={updatingPassword}
              >
                {updatingPassword ? 'Atualizando...' : 'Atualizar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Conta */}
        <Card className="rounded-2xl border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold">
              <Trash2 className="size-4 text-destructive" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Ao excluir sua conta, voce sera desconectado. Para exclusao definitiva dos seus dados, entre em contato com o suporte.
            </p>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="destructive"
                    className="h-12 w-full rounded-xl font-heading text-sm font-semibold"
                    disabled={deleting}
                  />
                }
              >
                <Trash2 className="size-4" />
                {deleting ? 'Excluindo...' : 'Excluir conta'}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voce sera desconectado e precisara entrar em contato com o suporte para exclusao definitiva dos dados. Essa acao nao pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDeleteAccount}
                  >
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify profile and settings**

Check: profile has colored badges (amber/green/blue by stage), icons in all inputs. Settings has segmented theme control (3 buttons), Shield icon, Lock icons in inputs, destructive card has red border.

- [ ] **Step 5: Commit**

```bash
git add web/src/app/profile/page.tsx web/src/app/settings/page.tsx web/src/components/theme-toggle.tsx
git commit -m "style: redesign profile and settings — colored badges, segmented theme, icon inputs"
```

---

### Task 8: Final Verification & Build

- [ ] **Step 1: Run build to catch any type errors**

Run: `cd web && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Visual verification checklist**

Run: `cd web && npm run dev`

Check each page in BOTH light and dark mode:
- [ ] Login page: dot grid, icons, gradient button
- [ ] Register page: same treatment
- [ ] Forgot password: same treatment
- [ ] Chat empty state: gradient title, suggestion chips work
- [ ] Chat with messages: green bubbles (assistant), gradient bubbles (user), bold in primary
- [ ] Streaming: cursor blinks, bubble matches style
- [ ] Typing: dots inside bubble with avatar
- [ ] Sidebar: gradient new-chat button, active item green border
- [ ] Header: taller, Jakarta font, green brand
- [ ] Onboarding: progress bar, icons, dot grid
- [ ] Profile: colored stage badges, icons
- [ ] Settings: segmented theme control, sections with icons
- [ ] Dark mode: neutral gray background, bright green accents

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "style: complete design overhaul — Tropical & Vibrante theme"
```
