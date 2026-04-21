'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/')
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
          <h1 className="font-heading text-[2.75rem] font-extrabold leading-[0.98] tracking-tight">
            Volta aí,{' '}
            <em className="not-italic bg-[image:var(--gradient-brand-strong)] bg-clip-text text-transparent">
              bora
            </em>{' '}
            crescer.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Tudo certo — só entrar.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {urlError === 'invalid_link' && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 rounded-xl border-[2px] border-ink bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              Link invalido ou expirado. Solicite um novo.
            </div>
          )}
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
                autoComplete="current-password"
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
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[13px] text-accent font-semibold hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-12 rounded-xl border-[2px] border-ink bg-primary text-primary-foreground font-heading text-[15px] font-bold hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-[2px] hover:-translate-y-[2px] transition-all"
            disabled={loading}
          >
            {loading ? '...' : 'Entrar →'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Novo por aqui?{' '}
            <Link
              href="/register"
              className="text-accent font-bold border-b-2 border-accent hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="relative">
          <span
            className="absolute -top-3 -left-3 h-12 w-12 rounded-full border-[3px] border-ink bg-coral -z-10"
            aria-hidden
          />
          <span
            className="absolute -bottom-4 right-6 h-10 w-10 rounded-lg border-[3px] border-ink bg-sun rotate-12 -z-10"
            aria-hidden
          />
          <div className="relative rounded-3xl border-[3px] border-ink bg-card p-8 shadow-hard-lg space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
