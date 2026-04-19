'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

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

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      setUserId(session.user.id)

      // Pre-fill if user already has partial data
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
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-2xl font-bold text-white">
            M
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Bem-vindo ao Max Impulso!
            </CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Nos conte um pouco sobre seu negocio para personalizar sua experiencia.
            </p>
          </CardHeader>

          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Como voce gostaria de ser chamado?"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="setor">Setor</Label>
                <Input
                  id="setor"
                  type="text"
                  placeholder="Ex: Confeitaria, Estetica, Marketing Digital"
                  value={setor}
                  onChange={(e) => setSetor(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempoNegocio">Tempo de negocio</Label>
                <Input
                  id="tempoNegocio"
                  type="text"
                  placeholder="Ex: 2 anos, 6 meses"
                  value={tempoNegocio}
                  onChange={(e) => setTempoNegocio(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faturamento">Faturamento mensal</Label>
                <Input
                  id="faturamento"
                  type="text"
                  placeholder="Ex: R$ 5.000, 10mil"
                  value={faturamento}
                  onChange={(e) => setFaturamento(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="desafio">Principal desafio</Label>
                <Textarea
                  id="desafio"
                  placeholder="Ex: Precificacao, captar clientes, gestao financeira"
                  value={desafio}
                  onChange={(e) => setDesafio(e.target.value)}
                  className="min-h-[88px]"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={saving || skipping}
              >
                {saving ? 'Salvando...' : 'Salvar e conversar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                disabled={saving || skipping}
                onClick={handleSkip}
              >
                {skipping ? 'Redirecionando...' : 'Pular e conversar direto'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
