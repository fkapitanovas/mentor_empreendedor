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
