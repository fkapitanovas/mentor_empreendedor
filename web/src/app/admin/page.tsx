'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Search, ShieldAlert, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { User } from '@/types/database'

const ESTAGIO_BADGE: Record<string, string> = {
  iniciante: 'bg-[var(--sun)] text-ink border-[2px] border-ink',
  em_crescimento: 'bg-[var(--coral)] text-[var(--cream)] border-[2px] border-ink',
  consolidado: 'bg-primary text-primary-foreground border-[2px] border-ink',
}

const ESTAGIO_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  em_crescimento: 'Em Crescimento',
  consolidado: 'Consolidado',
}

const PAGE_SIZE = 50

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [denied, setDenied] = useState(false)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')

  const hasMore = users.length < total

  const loadPage = useCallback(async (nextOffset: number, append: boolean) => {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(nextOffset),
    })
    const res = await fetch(`/api/admin/users?${params.toString()}`)
    if (res.status === 403) {
      setDenied(true)
      return { ok: false as const }
    }
    if (!res.ok) {
      return { ok: false as const }
    }
    const data = (await res.json()) as {
      users: User[]
      total: number
      limit: number
      offset: number
    }
    setUsers((prev) => (append ? [...prev, ...data.users] : data.users))
    setTotal(data.total)
    setOffset(nextOffset + data.users.length)
    return { ok: true as const }
  }, [])

  useEffect(() => {
    async function init() {
      await loadPage(0, false)
      setLoading(false)
    }
    init()
  }, [loadPage])

  async function handleLoadMore() {
    setLoadingMore(true)
    await loadPage(offset, true)
    setLoadingMore(false)
  }

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter((u) => {
      const email = (u.email ?? '').toLowerCase()
      const name = (u.name ?? '').toLowerCase()
      return email.includes(q) || name.includes(q)
    })
  }, [users, query])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6 md:p-10">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    )
  }

  if (denied) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="size-12 text-destructive" />
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">
            Esta página é restrita a administradores.
          </p>
          <Link href="/">
            <Button
              variant="outline"
              className="rounded-xl border-[2px] border-ink font-heading font-bold"
            >
              <ArrowLeft className="size-4" />
              Voltar ao chat
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:underline"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-4xl font-extrabold tracking-tight">Painel Admin</h1>
          <p
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
            aria-live="polite"
          >
            {users.length} de {total} empreendedor{total !== 1 ? 'es' : ''} carregado{users.length !== 1 ? 's' : ''}
            {query.trim() && (
              <>
                {' '}
                &middot; {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''} para &ldquo;{query.trim()}&rdquo;
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/citations">
            <Button
              variant="outline"
              className="border-[2px] border-ink rounded-xl font-heading font-bold hover:bg-[var(--sun)] hover:text-ink transition-all"
            >
              <Sparkles className="size-4" />
              Citações do prompt
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/api/admin/users?format=csv'
            }}
            className="border-[2px] border-ink rounded-xl font-heading font-bold hover:bg-[var(--sun)] hover:text-ink transition-all"
          >
            <Download className="size-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
          <Input
            type="search"
            placeholder="Buscar por email ou nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 rounded-xl border-[2px] border-ink bg-popover px-4 pl-10 font-sans text-[15px] focus-visible:border-accent focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
            aria-label="Buscar usuários"
          />
        </div>
      </div>

      <div className="rounded-3xl border-[3px] border-ink bg-card overflow-hidden shadow-hard-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b-[2px] border-ink">
                <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider">Setor</th>
                <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider">Estágio</th>
                <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider">Faturamento</th>
                <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider">Desafio</th>
                <th className="px-4 py-3 text-left font-heading text-xs uppercase tracking-wider">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b-[2px] border-ink/10 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{user.name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email || '—'}</td>
                  <td className="px-4 py-3">{user.setor || '—'}</td>
                  <td className="px-4 py-3">
                    {user.estagio ? (
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 font-heading text-xs font-bold uppercase tracking-wider ${ESTAGIO_BADGE[user.estagio] || ''}`}
                      >
                        {ESTAGIO_LABELS[user.estagio] || user.estagio}
                      </span>
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && !query.trim() && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="h-12 rounded-xl border-[2px] border-ink bg-[var(--sun)] text-ink font-heading font-bold hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  )
}
