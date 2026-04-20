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
