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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      setPasswordError('As senhas nao coincidem.')
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
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar ao chat
      </Link>

      <h1 className="mb-6 font-heading text-xl font-bold">Configuracoes</h1>

      <div className="space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold">
              <Palette className="size-4 text-primary" />
              Aparencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tema</p>
                <p className="text-xs text-muted-foreground">
                  Escolha entre claro, escuro ou sistema
                </p>
              </div>
              <ThemeToggle variant="segmented" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold">
              <Shield className="size-4 text-primary" />
              Seguranca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="font-heading text-[13px] font-semibold">Nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-heading text-[13px] font-semibold">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-[1.5px] pl-10"
                  />
                </div>
              </div>

              {passwordError && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
                >
                  <AlertCircle className="size-4 shrink-0" />
                  {passwordError}
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-[image:var(--gradient-brand)] font-heading text-sm font-semibold text-white hover:brightness-105"
                disabled={updatingPassword}
              >
                {updatingPassword ? 'Atualizando...' : 'Atualizar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base font-bold">
              <Trash2 className="size-4 text-destructive" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              id="delete-account-help"
              className="mb-4 text-sm text-muted-foreground"
            >
              Ao excluir sua conta, voce sera desconectado. Para exclusao definitiva dos seus dados, entre em contato com o suporte.
            </p>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="destructive"
                    aria-describedby="delete-account-help"
                    className="h-12 w-full rounded-xl font-heading text-sm font-semibold"
                    disabled={deleting}
                  />
                }
              >
                <Trash2 className="size-4" />
                {deleting ? 'Excluindo...' : 'Excluir conta'}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voce sera desconectado e precisara entrar em contato com o suporte para exclusao definitiva dos dados. Essa acao nao pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleDeleteAccount}
                  >
                    Sim, excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
