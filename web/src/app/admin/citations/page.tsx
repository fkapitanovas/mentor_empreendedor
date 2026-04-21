'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, ShieldAlert, Sparkles, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type RankingItem = {
  type: 'guru' | 'livro'
  key: string
  name: string
  total: number
  mentions: number
  uniqueUsers: number
  byEstagio: Record<string, number>
  bySetor: Record<string, number>
}

type Response = {
  filters: {
    estagio?: string
    setor?: string
    since?: string
    limit: number
  }
  sampleSize: number
  gurus: RankingItem[]
  livros: RankingItem[]
}

const ESTAGIO_OPTIONS = [
  { value: '', label: 'Todos os estágios' },
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'crescimento', label: 'Em crescimento' },
  { value: 'consolidado', label: 'Consolidado' },
]

const SINCE_OPTIONS = [
  { value: '', label: 'Desde sempre' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
]

function sinceToIso(value: string): string | undefined {
  if (!value) return undefined
  const match = value.match(/^(\d+)d$/)
  if (!match) return undefined
  const days = Number(match[1])
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString()
}

function topEntries(record: Record<string, number>, n = 3): string {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, n)
  if (entries.length === 0) return '—'
  return entries.map(([k, v]) => `${k} (${v})`).join(' · ')
}

function RankingTable({
  title,
  icon,
  items,
}: {
  title: string
  icon: React.ReactNode
  items: RankingItem[]
}) {
  const max = items.length > 0 ? items[0].total : 1
  return (
    <section className="rounded-3xl border-[3px] border-ink bg-card overflow-hidden shadow-hard-lg">
      <header className="px-6 py-4 border-b-[2px] border-ink bg-muted flex items-center gap-2">
        {icon}
        <h2 className="font-heading text-lg font-extrabold">{title}</h2>
        <span className="ml-auto font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background/50 border-b-[2px] border-ink/20">
              <th className="px-4 py-2 text-left font-heading text-xs uppercase tracking-wider">#</th>
              <th className="px-4 py-2 text-left font-heading text-xs uppercase tracking-wider">Nome</th>
              <th className="px-4 py-2 text-right font-heading text-xs uppercase tracking-wider" title="Total de menções">
                Total
              </th>
              <th className="px-4 py-2 text-right font-heading text-xs uppercase tracking-wider" title="Mensagens distintas">
                Msgs
              </th>
              <th className="px-4 py-2 text-right font-heading text-xs uppercase tracking-wider" title="Usuários únicos">
                Users
              </th>
              <th className="px-4 py-2 text-left font-heading text-xs uppercase tracking-wider">Top estágio</th>
              <th className="px-4 py-2 text-left font-heading text-xs uppercase tracking-wider">Top setor</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const pct = (item.total / max) * 100
              return (
                <tr key={item.key} className="border-b-[1px] border-ink/10 last:border-0">
                  <td className="px-4 py-2 font-mono text-muted-foreground">{idx + 1}</td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{item.name}</div>
                    <div
                      className="mt-1 h-1.5 rounded bg-[var(--sun)] border border-ink/40"
                      style={{ width: `${pct}%`, maxWidth: '200px' }}
                      aria-hidden
                    />
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold">{item.total}</td>
                  <td className="px-4 py-2 text-right font-mono text-muted-foreground">{item.mentions}</td>
                  <td className="px-4 py-2 text-right font-mono text-muted-foreground">{item.uniqueUsers}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{topEntries(item.byEstagio)}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{topEntries(item.bySetor)}</td>
                </tr>
              )
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma citação registrada para os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function CitationsPage() {
  const [data, setData] = useState<Response | null>(null)
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estagio, setEstagio] = useState('')
  const [setor, setSetor] = useState('')
  const [since, setSince] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const params = new URLSearchParams()
      if (estagio) params.set('estagio', estagio)
      if (setor.trim()) params.set('setor', setor.trim())
      const sinceIso = sinceToIso(since)
      if (sinceIso) params.set('since', sinceIso)

      setLoading(true)
      setError(null)

      const res = await fetch(`/api/admin/citations?${params.toString()}`)
      if (cancelled) return
      if (res.status === 403) {
        setDenied(true)
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError('Erro ao carregar citações.')
        setLoading(false)
        return
      }
      const body = (await res.json()) as Response
      if (cancelled) return
      setData(body)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [estagio, setor, since])

  // Setores únicos vindos dos dados (para facilitar filtro) — pega do ranking consolidado
  const knownSetores = useMemo(() => {
    if (!data) return []
    const s = new Set<string>()
    for (const item of [...data.gurus, ...data.livros]) {
      for (const k of Object.keys(item.bySetor)) {
        if (k && k !== '(sem perfil)') s.add(k)
      }
    }
    return Array.from(s).sort()
  }, [data])

  if (denied) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <ShieldAlert className="size-12 text-destructive" />
          <h1 className="font-heading text-2xl font-extrabold tracking-tight">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground">Esta página é restrita a administradores.</p>
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
    <div className="mx-auto max-w-6xl p-6 md:p-10">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar ao painel
        </Link>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="size-7 text-accent" />
          <h1 className="font-heading text-4xl font-extrabold tracking-tight">
            Citações do prompt
          </h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Quais gurus e livros o Max está citando — por estágio, setor e período.
          Use para iterar a curadoria: se um livro nunca aparece, avalie remover ou
          reescrever o contexto em que ele deveria ser ativado.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Estágio
          </span>
          <select
            value={estagio}
            onChange={(e) => setEstagio(e.target.value)}
            className="h-11 rounded-xl border-[2px] border-ink bg-popover px-3 font-sans text-sm focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
          >
            {ESTAGIO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Setor (busca exata)
          </span>
          <input
            list="setores-conhecidos"
            type="text"
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            placeholder="ex: confeitaria, beleza, moda..."
            className="h-11 rounded-xl border-[2px] border-ink bg-popover px-3 font-sans text-sm focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
          />
          <datalist id="setores-conhecidos">
            {knownSetores.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Período
          </span>
          <select
            value={since}
            onChange={(e) => setSince(e.target.value)}
            className="h-11 rounded-xl border-[2px] border-ink bg-popover px-3 font-sans text-sm focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
          >
            {SINCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {data && !loading && (
        <p
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
          aria-live="polite"
        >
          {data.sampleSize} citações amostradas · {data.gurus.length} gurus · {data.livros.length} livros
        </p>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border-[3px] border-destructive bg-destructive/10 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <RankingTable
            title="Gurus mais citados"
            icon={<Users className="size-5 text-accent" />}
            items={data.gurus}
          />
          <RankingTable
            title="Livros mais citados"
            icon={<BookOpen className="size-5 text-accent" />}
            items={data.livros}
          />
        </div>
      ) : null}
    </div>
  )
}
