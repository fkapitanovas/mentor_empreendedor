'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatHome() {
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function init() {
      // Try to load existing conversations
      const res = await fetch('/api/conversations')
      if (!res.ok) return

      const conversations = await res.json()

      if (conversations.length > 0) {
        // Navigate to most recent
        router.replace(`/c/${conversations[0].id}`)
      } else {
        // Create a new conversation
        const createRes = await fetch('/api/conversations', { method: 'POST' })
        if (createRes.ok) {
          const conv = await createRes.json()
          router.replace(`/c/${conv.id}`)
        }
      }
    }

    init()
  }, [router])

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
