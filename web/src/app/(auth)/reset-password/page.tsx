'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.updateUser({
      password,
    })

    if (authError) {
      setError('Erro ao redefinir senha. Tente novamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/'), 2000)
  }

  if (success) {
    return (
      <Card className="rounded-2xl shadow-lg">
        <CardContent
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-4 px-8 pt-8 pb-8"
        >
          <div className="animate-message-in flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="font-heading text-lg font-bold text-center">Senha redefinida!</h2>
          <p className="text-sm text-muted-foreground text-center">
            Sua senha foi alterada com sucesso. Redirecionando...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="px-8 pt-8">
        <CardTitle className="text-center font-heading text-xl font-bold">Redefinir senha</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-8">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password" className="font-heading text-[13px] font-semibold">Nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-[1.5px] pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-heading text-[13px] font-semibold">Confirmar nova senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-11 rounded-xl border-[1.5px] pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-8 pb-8">
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-[image:var(--gradient-brand)] font-heading text-sm font-semibold text-white transition-all duration-150 hover:shadow-md hover:brightness-105"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
