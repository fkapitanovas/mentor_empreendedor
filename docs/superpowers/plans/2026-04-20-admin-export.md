# Admin Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Página `/admin` protegida por email que lista perfis de empreendedores e exporta CSV.

**Architecture:** API route server-side valida admin via env var `ADMIN_EMAILS`, usa service role key para bypassar RLS e ler todos os users. Página client consome a API e renderiza tabela + botão download CSV.

**Tech Stack:** Next.js 16 App Router, Supabase (service role), Lucide React

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `web/src/app/api/admin/users/route.ts` | Create | API: validação admin + query users + resposta JSON/CSV |
| `web/src/app/admin/page.tsx` | Create | Página admin: tabela de perfis + botão exportar |

---

### Task 1: API Route — Admin Users

**Files:**
- Create: `web/src/app/api/admin/users/route.ts`

- [ ] **Step 1: Create the API route**

Create `web/src/app/api/admin/users/route.ts`:

```ts
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { User } from '@/types/database'

const CSV_HEADERS: Record<string, string> = {
  email: 'Email',
  name: 'Nome',
  setor: 'Setor',
  estagio: 'Estágio',
  tempo_negocio: 'Tempo de Negócio',
  faturamento: 'Faturamento',
  faturamento_mensal: 'Faturamento Mensal',
  desafio_principal: 'Desafio Principal',
  is_onboarded: 'Onboarded',
  created_at: 'Cadastro',
}

const CSV_COLUMNS = Object.keys(CSV_HEADERS) as (keyof User)[]

function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function usersToCsv(users: User[]): string {
  const header = CSV_COLUMNS.map((col) => CSV_HEADERS[col]).join(',')
  const rows = users.map((user) =>
    CSV_COLUMNS.map((col) => escapeCsv(user[col])).join(',')
  )
  return [header, ...rows].join('\n')
}

export async function GET(request: Request) {
  // 1. Validate auth
  const supabase = await createServerClient()
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !authUser) {
    return new Response(JSON.stringify({ error: 'Nao autorizado' }), {
      status: 401,
    })
  }

  // 2. Check admin
  if (!isAdmin(authUser.email)) {
    return new Response(JSON.stringify({ error: 'Acesso negado' }), {
      status: 403,
    })
  }

  // 3. Query all users with service role (bypasses RLS)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: users, error: queryError } = await adminClient
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (queryError) {
    return new Response(JSON.stringify({ error: 'Erro ao buscar usuarios' }), {
      status: 500,
    })
  }

  // 4. Return CSV or JSON
  const { searchParams } = new URL(request.url)

  if (searchParams.get('format') === 'csv') {
    const today = new Date().toISOString().slice(0, 10)
    return new Response(usersToCsv(users as User[]), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=usuarios-${today}.csv`,
      },
    })
  }

  return Response.json(users)
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/kapi/mentor_empreendedor/web && npm run build`
Expected: Build succeeds, new route `/api/admin/users` appears as dynamic.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/api/admin/users/route.ts
git commit -m "feat: add admin users API with CSV export

Validates admin via ADMIN_EMAILS env var, bypasses RLS with service
role key, supports ?format=csv for download.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Admin Page

**Files:**
- Create: `web/src/app/admin/page.tsx`

- [ ] **Step 1: Create the admin page**

Create `web/src/app/admin/page.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/types/database'

const ESTAGIO_COLORS: Record<string, string> = {
  iniciante: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  em_crescimento: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  consolidado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const ESTAGIO_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  em_crescimento: 'Em Crescimento',
  consolidado: 'Consolidado',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/users')
      if (res.status === 403) {
        setDenied(true)
        setLoading(false)
        return
      }
      if (!res.ok) {
        setLoading(false)
        return
      }
      const data = await res.json()
      setUsers(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (denied) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="size-12 text-destructive" />
          <h1 className="font-heading text-xl font-bold">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Esta pagina e restrita a administradores.
          </p>
          <Link href="/">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="size-4" />
              Voltar ao chat
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} empreendedor{users.length !== 1 ? 'es' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => {
            window.location.href = '/api/admin/users?format=csv'
          }}
          className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-700 font-heading text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-800"
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-heading font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Setor</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Estagio</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Faturamento</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Desafio</th>
                <th className="px-4 py-3 text-left font-heading font-semibold">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr
                  key={user.id}
                  className={i % 2 === 1 ? 'bg-muted/20' : ''}
                >
                  <td className="px-4 py-3 font-medium">{user.name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email || '—'}</td>
                  <td className="px-4 py-3">{user.setor || '—'}</td>
                  <td className="px-4 py-3">
                    {user.estagio ? (
                      <Badge className={`border-0 ${ESTAGIO_COLORS[user.estagio] || ''}`}>
                        {ESTAGIO_LABELS[user.estagio] || user.estagio}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3">{user.faturamento || '—'}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{user.desafio_principal || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/kapi/mentor_empreendedor/web && npm run build`
Expected: Build succeeds, `/admin` appears as static route.

- [ ] **Step 3: Commit**

```bash
git add web/src/app/admin/page.tsx
git commit -m "feat: add admin page with user table and CSV export button

Shows all registered entrepreneurs with colored stage badges.
Access denied screen for non-admin users.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Add ADMIN_EMAILS env var to Vercel

**Files:** None (Vercel dashboard/CLI config only)

- [ ] **Step 1: Add env var to Vercel**

Run:
```bash
echo "fkapitanovas@gmail.com" | vercel env add ADMIN_EMAILS production
```

- [ ] **Step 2: Verify env var is set**

Run: `vercel env ls | grep ADMIN`
Expected: `ADMIN_EMAILS` appears for production.

- [ ] **Step 3: Deploy**

Run: `cd /Users/kapi/mentor_empreendedor/web && vercel --prod`
Expected: Deploy succeeds. `/admin` loads and shows the user table. `/api/admin/users?format=csv` downloads a CSV file.
