'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, AlertCircle, CheckCircle } from 'lucide-react'

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
      redirectTo: `${window.location.origin}/auth/recovery`,
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
            <CheckCircle className="h-8 w-8 text-[color:var(--ink)]" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-center">E-mail enviado!</h2>
          <p className="text-sm text-muted-foreground text-center">
            Enviamos um link para redefinir sua senha. Verifique seu e-mail.
          </p>
          <Link
            href="/login"
            className="text-sm text-accent font-bold border-b-2 border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Voltar para login
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
            Esqueceu?{' '}
            <em className="not-italic bg-[image:var(--gradient-brand-strong)] bg-clip-text text-transparent">
              Calma.
            </em>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
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
          <Button
            type="submit"
            className="w-full h-12 rounded-xl border-[2px] border-ink bg-primary text-primary-foreground font-heading text-[15px] font-bold hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
            disabled={loading}
          >
            {loading ? '...' : 'Enviar link →'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            <Link
              href="/login"
              className="text-accent font-bold border-b-2 border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Voltar para login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
