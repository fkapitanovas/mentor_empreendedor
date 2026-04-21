'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: string
  color: string
}

const STRENGTH_LABELS = ['Muito fraca', 'Fraca', 'Razoavel', 'Forte', 'Muito forte']
const STRENGTH_COLORS = [
  'bg-destructive',
  'bg-destructive',
  'bg-[var(--coral)]',
  'bg-[var(--sun)]',
  'bg-[color:var(--chart-1)]',
]

function calculatePasswordStrength(pw: string): PasswordStrength {
  if (!pw) return { score: 0, label: STRENGTH_LABELS[0], color: STRENGTH_COLORS[0] }
  let score = 0
  if (pw.length >= 8) score += 1
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1
  if (/\d/.test(pw)) score += 1
  if (/[^A-Za-z0-9]/.test(pw)) score += 1
  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4
  return {
    score: clamped,
    label: STRENGTH_LABELS[clamped],
    color: STRENGTH_COLORS[clamped],
  }
}

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { score, label, color } = calculatePasswordStrength(password)

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
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })

    if (authError) {
      setError('Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="relative">
        <span
          className="absolute -top-3 -left-3 h-12 w-12 rounded-full border-[3px] border-ink bg-coral -z-10"
          aria-hidden
        />
        <span
          className="absolute -bottom-4 right-6 h-10 w-10 rounded-lg border-[3px] border-ink bg-sun rotate-12 -z-10"
          aria-hidden
        />
        <div
          role="status"
          aria-live="polite"
          className="relative flex flex-col items-center gap-5 rounded-3xl border-[3px] border-ink bg-card p-8 shadow-hard-lg"
        >
          <div className="animate-message-in flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-ink bg-[var(--sun)] shadow-hard-sm">
            <Mail className="h-8 w-8 text-[color:var(--ink)]" />
          </div>
          <div className="text-center">
            <h2 className="font-heading text-2xl font-bold">Verifique seu e-mail</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enviamos um link de confirmacao para:
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">{email}</p>
          </div>
          <div className="w-full rounded-xl border-[2px] border-ink bg-muted p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Clique no link do e-mail para ativar sua conta.
              Nao recebeu? Verifique a pasta de spam.
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm text-accent font-bold border-b-2 border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Ja confirmei, ir para login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <span
        className="absolute -top-3 -left-3 h-12 w-12 rounded-full border-[3px] border-ink bg-coral -z-10"
        aria-hidden
      />
      <span
        className="absolute -bottom-4 right-6 h-10 w-10 rounded-lg border-[3px] border-ink bg-sun rotate-12 -z-10"
        aria-hidden
      />
      <div className="relative rounded-3xl border-[3px] border-ink bg-card p-8 shadow-hard-lg">
        <div>
          <h1 className="font-heading text-4xl font-extrabold leading-[0.98] tracking-tight">
            Cria sua conta.{' '}
            <em className="not-italic bg-[image:var(--gradient-brand-strong)] bg-clip-text text-transparent">
              Em 30 segundos.
            </em>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Sem burocracia — só o essencial.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 rounded-xl border-[2px] border-ink bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="block font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-xl border-[2px] border-ink bg-popover pl-10 pr-4 font-sans text-[15px] focus-visible:border-accent focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="block font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-[2px] border-ink bg-popover pl-10 pr-10 font-sans text-[15px] focus-visible:border-accent focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="space-y-1" aria-live="polite">
                <div className="flex gap-1 h-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-full bg-muted transition-colors',
                        i < score && color
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-heading font-semibold uppercase tracking-wider">{label}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="block font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-primary">
              Confirmar senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 rounded-xl border-[2px] border-ink bg-popover pl-10 pr-10 font-sans text-[15px] focus-visible:border-accent focus-visible:ring-0 focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-primary hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl border-[2px] border-ink bg-primary text-primary-foreground font-heading text-[15px] font-bold hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
            disabled={loading}
          >
            {loading ? '...' : 'Criar conta →'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Ja tem conta?{' '}
            <Link
              href="/login"
              className="text-accent font-bold border-b-2 border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
