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

const ESTAGIO_BADGE: Record<string, string> = {
  iniciante: 'bg-[var(--sun)] text-ink border-[2px] border-ink',
  em_crescimento: 'bg-[var(--coral)] text-[var(--cream)] border-[2px] border-ink',
  consolidado: 'bg-primary text-primary-foreground border-[2px] border-ink',
}

const FIELD_LABEL =
  'font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-primary'

const FIELD_INPUT =
  'h-12 rounded-xl border-[2px] border-ink bg-popover px-4 pl-10 font-sans text-[15px] focus-visible:border-accent focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all'

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
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:underline"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <div className="mb-8 space-y-1">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Seu Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Ajuste os dados que o Max usa para personalizar as respostas.
        </p>
      </div>

      <div className="rounded-3xl border-[3px] border-ink bg-card shadow-hard">
        <form onSubmit={handleSave}>
          <div className="space-y-4 p-6 md:p-8">
            <div className="space-y-2">
              <Label htmlFor="nome" className={FIELD_LABEL}>
                Nome
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Como você gostaria de ser chamado?"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={FIELD_INPUT}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="setor" className={FIELD_LABEL}>
                Setor
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
                <Input
                  id="setor"
                  type="text"
                  placeholder="Ex: Confeitaria, Estética, Marketing Digital"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className={FIELD_INPUT}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className={FIELD_LABEL}>Estágio</Label>
              <div className="flex items-center gap-3">
                <Select value={estagio} onValueChange={(v) => setEstagio(v ?? '')}>
                  <SelectTrigger className="h-12 w-full rounded-xl border-[2px] border-ink bg-popover px-4 font-sans text-[15px]">
                    <SelectValue placeholder="Selecionar estágio" />
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
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 font-heading text-xs font-bold uppercase tracking-wider ${ESTAGIO_BADGE[estagio] || ''}`}
                  >
                    {estagioLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tempoNegocio" className={FIELD_LABEL}>
                Tempo de negócio
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
                <Input
                  id="tempoNegocio"
                  type="text"
                  placeholder="Ex: 2 anos, 6 meses"
                  value={tempoNegocio}
                  onChange={(e) => setTempoNegocio(e.target.value)}
                  className={FIELD_INPUT}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="faturamento" className={FIELD_LABEL}>
                Faturamento mensal
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
                <Input
                  id="faturamento"
                  type="text"
                  placeholder="Ex: R$ 5.000, 10mil"
                  value={faturamento}
                  onChange={(e) => setFaturamento(e.target.value)}
                  className={FIELD_INPUT}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desafio" className={FIELD_LABEL}>
                Principal desafio
              </Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 size-4 text-primary/50" />
                <Textarea
                  id="desafio"
                  placeholder="Ex: Precificação, captar clientes, gestão financeira"
                  value={desafio}
                  onChange={(e) => setDesafio(e.target.value)}
                  className="min-h-[96px] rounded-xl border-[2px] border-ink bg-popover px-4 pl-10 py-3 font-sans text-[15px] focus-visible:border-accent focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 md:px-8 md:pb-8">
            <Button
              type="submit"
              className="h-12 w-full rounded-xl border-[2px] border-ink bg-[var(--sun)] text-ink font-heading font-bold hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              disabled={saving}
            >
              <Save className="size-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
