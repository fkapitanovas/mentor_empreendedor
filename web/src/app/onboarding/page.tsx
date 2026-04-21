'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Briefcase, Clock, DollarSign, Target } from 'lucide-react'
import { toast } from 'sonner'

const DRAFT_KEY = 'onboarding-draft'

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
  const [draftSaved, setDraftSaved] = useState(false)
  const restoredOnceRef = useRef(false)

  const filledCount = useMemo(() => {
    return [nome, setor, tempoNegocio, faturamento, desafio].filter(Boolean).length
  }, [nome, setor, tempoNegocio, faturamento, desafio])

  // Restore draft from sessionStorage (runs once on mount, before profile load)
  useEffect(() => {
    if (restoredOnceRef.current) return
    restoredOnceRef.current = true
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as {
        nome?: string
        setor?: string
        tempoNegocio?: string
        faturamento?: string
        desafio?: string
      }
      // Syncing persisted draft from sessionStorage into React state on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (draft.nome) setNome(draft.nome)
      if (draft.setor) setSetor(draft.setor)
      if (draft.tempoNegocio) setTempoNegocio(draft.tempoNegocio)
      if (draft.faturamento) setFaturamento(draft.faturamento)
      if (draft.desafio) setDesafio(draft.desafio)
    } catch {
      // ignore malformed drafts
    }
  }, [])

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
        // Only overwrite empty fields (draft takes precedence over empty profile columns)
        setNome((prev) => prev || profile.name || '')
        setSetor((prev) => prev || profile.setor || '')
        setTempoNegocio((prev) => prev || profile.tempo_negocio || '')
        setFaturamento((prev) => prev || profile.faturamento || '')
        setDesafio((prev) => prev || profile.desafio_principal || '')
      }
    }

    loadUser()
  }, [])

  // Debounced autosave of draft to sessionStorage
  const quotaWarnedRef = useRef(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ nome, setor, tempoNegocio, faturamento, desafio })
        )
        if (nome || setor || tempoNegocio || faturamento || desafio) {
          setDraftSaved(true)
        }
      } catch (err) {
        const isQuota =
          err instanceof DOMException &&
          (err.name === 'QuotaExceededError' || err.code === 22)
        if (isQuota && !quotaWarnedRef.current) {
          quotaWarnedRef.current = true
          toast.error(
            'Armazenamento cheio — seu rascunho não será salvo automaticamente.'
          )
        }
        // Modo privado / storage indisponível: silencioso
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [nome, setor, tempoNegocio, faturamento, desafio])

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

    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
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

    try {
      sessionStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
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
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand)] text-2xl font-bold text-white font-heading">
            M
          </div>
        </div>

        <Card className="rounded-2xl shadow-lg overflow-hidden">
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
                  <Input id="faturamento" type="text" inputMode="decimal" placeholder="Ex: R$ 5.000, 10mil" value={faturamento} onChange={(e) => setFaturamento(e.target.value)} className="h-11 rounded-xl border-[1.5px] pl-10" />
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

            <CardFooter className="flex flex-col gap-3 px-8 pb-8">
              <div className="flex w-full gap-3">
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
                  className="h-12 flex-1 rounded-xl bg-[image:var(--gradient-brand)] font-heading text-sm font-semibold text-white hover:brightness-105"
                  disabled={saving || skipping}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
              <p
                aria-live="polite"
                className={`text-xs text-muted-foreground transition-opacity ${draftSaved ? 'opacity-100' : 'opacity-0'}`}
              >
                Rascunho salvo
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
