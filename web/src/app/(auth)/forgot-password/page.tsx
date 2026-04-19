'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (authError) {
      setError('Erro ao enviar e-mail. Tente novamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-center">E-mail enviado!</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enviamos um link para redefinir sua senha. Verifique seu e-mail.
          </p>
          <Link
            href="/login"
            className="text-sm text-primary underline underline-offset-4"
          >
            Voltar para login
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Esqueci minha senha</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={error ? 'border-destructive' : ''}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full h-11" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link'}
          </Button>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Voltar para login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
