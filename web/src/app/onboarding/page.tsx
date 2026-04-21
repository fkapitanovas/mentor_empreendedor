'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Briefcase, Clock, DollarSign, Target } from 'lucide-react'
import { toast } from 'sonner'

const DRAFT_KEY = 'onboarding-draft'

const FIELD_LABEL =
  'font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-primary'

const FIELD_INPUT =
  'h-12 rounded-xl border-[2px] border-ink bg-popover px-4 pl-10 font-sans text-[15px] focus-visible:border-accent focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all'

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
    <div className="tropical-mesh flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 bg-primary text-primary-foreground rounded-full font-heading text-xs font-bold uppercase tracking-widest shadow-hard-sm -rotate-[2deg]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sun)] text-ink font-extrabold text-sm">
              M
            </span>
            Max Impulso
          </div>
        </div>

        <div className="relative">
          <span
            className="absolute -top-3 -left-3 h-12 w-12 rounded-full border-[3px] border-ink bg-coral -z-10"
            aria-hidden
          />
          <span
            className="absolute -bottom-4 right-8 h-10 w-10 rounded-lg border-[3px] border-ink bg-sun rotate-12 -z-10"
            aria-hidden
          />
          <div className="relative rounded-3xl border-[3px] border-ink bg-card overflow-hidden shadow-hard-lg">
            <div className="h-2 bg-muted border-b-[3px] border-ink">
              <div
                className="h-full bg-[image:var(--gradient-brand-strong)] transition-all duration-500"
                style={{ width: `${(filledCount / 5) * 100}%` }}
              />
            </div>

            <div className="px-8 pt-8 pb-4 space-y-2">
              <h1 className="font-heading text-3xl font-extrabold leading-[0.98] tracking-tight text-center">
                Conte um pouco sobre seu negócio
              </h1>
              <p className="text-center text-sm text-muted-foreground">
                Isso ajuda o Max a dar dicas mais certeiras. Pode pular se preferir.
              </p>
            </div>

            <form onSubmit={handleSave}>
              <div className="space-y-4 px-8 pt-4">
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
                      inputMode="decimal"
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

              <div className="flex flex-col gap-3 px-8 pt-6 pb-8">
                <div className="flex w-full gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border-[2px] border-ink bg-card font-heading font-bold hover:bg-muted transition-all"
                    disabled={saving || skipping}
                    onClick={handleSkip}
                  >
                    {skipping ? 'Redirecionando...' : 'Pular'}
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 flex-1 rounded-xl border-[2px] border-ink bg-[var(--sun)] text-ink font-heading font-bold hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                    disabled={saving || skipping}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
                <p
                  aria-live="polite"
                  className={`text-xs text-[var(--coral)] font-semibold transition-opacity ${draftSaved ? 'opacity-100' : 'opacity-0'}`}
                >
                  Rascunho salvo
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
