'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Auth error:', error)
  }, [error])

  return (
    <Card className="rounded-2xl shadow-lg">
      <CardHeader className="flex flex-col items-center gap-2 px-8 pt-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h1 className="font-heading text-lg font-bold">Algo deu errado</h1>
      </CardHeader>
      <CardContent className="px-8">
        <p className="text-center text-sm text-muted-foreground">
          Tivemos um problema ao carregar esta tela de autenticação. Você pode tentar novamente.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 px-8 pb-8">
        <Button
          onClick={reset}
          className="w-full bg-[image:var(--gradient-brand)] text-white"
        >
          Tentar novamente
        </Button>
      </CardFooter>
    </Card>
  )
}
