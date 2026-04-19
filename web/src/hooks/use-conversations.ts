'use client'

import { useState, useCallback } from 'react'
import type { Conversation } from '@/types/database'

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const loadConversations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setLoading(false)
    }
  }, [])

  const createConversation = useCallback(async (): Promise<Conversation> => {
    const res = await fetch('/api/conversations', { method: 'POST' })
    const conv = await res.json()
    setConversations((prev) => [conv, ...prev])
    return conv
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
    setConversations((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { conversations, setConversations, loading, loadConversations, createConversation, deleteConversation }
}
