'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Chat error:', error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h1 className="font-heading text-xl font-bold">Não foi possível carregar a conversa</h1>
        <p className="text-sm text-muted-foreground">
          Tivemos um problema ao carregar este chat. Tente novamente ou selecione outra conversa na barra lateral.
        </p>
        <Button
          onClick={reset}
          className="bg-[image:var(--gradient-brand)] text-white"
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}
