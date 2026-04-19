'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Seu Perfil</CardTitle>
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
              <Label>Estagio</Label>
              <div className="flex items-center gap-3">
                <Select value={estagio} onValueChange={(v) => setEstagio(v ?? '')}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Selecionar estagio" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTAGIOS.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {estagioLabel && (
                  <Badge variant="secondary" className="shrink-0">
                    {estagioLabel}
                  </Badge>
                )}
              </div>
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

          <CardFooter>
            <Button
              type="submit"
              className="h-11 w-full"
              disabled={saving}
            >
              <Save className="size-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
