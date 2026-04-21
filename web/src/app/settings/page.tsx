'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, Palette, Trash2, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const FIELD_LABEL =
  'font-heading text-[11px] font-bold uppercase tracking-[0.08em] text-primary'

const FIELD_INPUT =
  'h-12 rounded-xl border-[2px] border-ink bg-popover px-4 pl-10 font-sans text-[15px] focus-visible:border-accent focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 transition-all'

export default function SettingsPage() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.')
      return
    }

    setUpdatingPassword(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setUpdatingPassword(false)

    if (error) {
      setPasswordError('Erro ao atualizar senha. Tente novamente.')
    } else {
      toast.success('Senha atualizada com sucesso')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)

    const supabase = createClient()
    await supabase.auth.signOut()

    toast.info('Para excluir sua conta definitivamente, entre em contato com o suporte.')
    router.push('/login')
  }

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent font-semibold hover:underline"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <div className="mb-8 space-y-1">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Preferências de aparência, segurança e conta.
        </p>
      </div>

      <div className="space-y-6">
        {/* Aparencia */}
        <section className="rounded-3xl border-[3px] border-ink bg-card p-6 shadow-hard">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sun)] border-[2px] border-ink text-ink">
              <Palette className="size-5" />
            </span>
            <h2 className="font-heading text-lg font-bold">Aparência</h2>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Tema</p>
              <p className="text-xs text-muted-foreground">
                Escolha entre claro, escuro ou sistema
              </p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
        </section>

        {/* Seguranca */}
        <section className="rounded-3xl border-[3px] border-ink bg-card p-6 shadow-hard">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sun)] border-[2px] border-ink text-ink">
              <Shield className="size-5" />
            </span>
            <h2 className="font-heading text-lg font-bold">Segurança</h2>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className={FIELD_LABEL}>
                Nova senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={FIELD_INPUT}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={FIELD_LABEL}>
                Confirmar nova senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary/50" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={FIELD_INPUT}
                />
              </div>
            </div>

            {passwordError && (
              <div
                role="alert"
                aria-live="polite"
                className="flex items-center gap-2 rounded-xl border-[2px] border-[var(--coral)] bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="size-4 shrink-0" />
                {passwordError}
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl border-[2px] border-ink bg-[var(--sun)] text-ink font-heading font-bold hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              disabled={updatingPassword}
            >
              {updatingPassword ? 'Atualizando...' : 'Atualizar senha'}
            </Button>
          </form>
        </section>

        {/* Conta / Delete */}
        <section
          className="rounded-3xl border-[3px] border-[var(--coral)] bg-card p-6"
          style={{ boxShadow: '6px 6px 0 var(--coral)' }}
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--coral)] border-[2px] border-ink text-[var(--cream)]">
              <Trash2 className="size-5" />
            </span>
            <h2 className="font-heading text-lg font-bold">Conta</h2>
          </div>
          <p
            id="delete-account-help"
            className="mb-4 text-sm text-muted-foreground"
          >
            Ao excluir sua conta, você será desconectado. Para exclusão definitiva dos seus dados, entre em contato com o suporte.
          </p>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="destructive"
                  aria-describedby="delete-account-help"
                  className="h-11 w-full rounded-xl border-[2px] border-ink bg-destructive text-destructive-foreground font-heading font-bold hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                  disabled={deleting}
                />
              }
            >
              <Trash2 className="size-4" />
              {deleting ? 'Excluindo...' : 'Excluir conta'}
            </AlertDialogTrigger>
            <AlertDialogContent className="border-[3px] border-ink rounded-3xl shadow-hard-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading text-xl font-extrabold">
                  Excluir conta?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Você será desconectado e precisará entrar em contato com o suporte para exclusão definitiva dos dados. Essa ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground border-[2px] border-ink rounded-xl font-heading font-bold hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  Sim, excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </div>
  )
}
