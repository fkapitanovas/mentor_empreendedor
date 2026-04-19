'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types/database'

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  const loadMessages = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data as Message[])
    }
  }, [conversationId])

  const sendMessage = useCallback(
    async (text: string) => {
      // 1. Optimistically add user message
      const userMsg: Message = {
        id: crypto.randomUUID(),
        user_id: '',
        conversation_id: conversationId,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])

      // 2. Start streaming
      setIsStreaming(true)
      setStreamingText('')

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, message: text }),
        })

        if (!response.ok || !response.body) {
          setIsStreaming(false)
          return
        }

        // 3. Read SSE stream
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let fullText = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue

            try {
              const data = JSON.parse(line.slice(6))

              if (data.error) {
                // Error from server
                const errorMsg: Message = {
                  id: crypto.randomUUID(),
                  user_id: '',
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
                  created_at: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, errorMsg])
                setStreamingText('')
                break
              }

              if (data.done) {
                // Final: add assistant message to state
                const assistantMsg: Message = {
                  id: crypto.randomUUID(),
                  user_id: '',
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: fullText,
                  created_at: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, assistantMsg])
                setStreamingText('')
              } else if (data.text) {
                fullText += data.text
                setStreamingText(fullText)
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      } catch {
        // Network error
        const errorMsg: Message = {
          id: crypto.randomUUID(),
          user_id: '',
          conversation_id: conversationId,
          role: 'assistant',
          content: 'Erro de conexao. Verifique sua internet e tente novamente.',
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMsg])
        setStreamingText('')
      } finally {
        setIsStreaming(false)
      }
    },
    [conversationId]
  )

  return { messages, setMessages, isStreaming, streamingText, sendMessage, loadMessages }
}
