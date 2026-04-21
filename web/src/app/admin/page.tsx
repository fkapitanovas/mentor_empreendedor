'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Search, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-xl font-bold">Painel Admin</h1>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {users.length} de {total} empreendedor{total !== 1 ? 'es' : ''} carregado{users.length !== 1 ? 's' : ''}
            {query.trim() && (
              <>
                {' '}
                &middot; {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''} para &ldquo;{query.trim()}&rdquo;
              </>
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            window.location.href = '/api/admin/users?format=csv'
          }}
          className="rounded-xl bg-[image:var(--gradient-brand)] font-heading text-sm font-semibold text-white hover:brightness-105"
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por email ou nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 rounded-xl border-[1.5px] pl-10"
            aria-label="Buscar usuarios"
          />
        </div>
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
              {filteredUsers.map((user, i) => (
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Nenhum usuario encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {hasMore && !query.trim() && (
        <div className="mt-4 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            variant="outline"
            className="rounded-xl font-heading text-sm font-semibold"
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}
    </div>
  )
}
