'use client'

import { useCallback, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/types/database'

function cleanProfileTags(text: string): string {
  let cleaned = text
    .replace(/\[PERFIL_EXTRAIDO\][\s\S]*?\[\/PERFIL_EXTRAIDO\]/g, '')
    .replace(/\[PERFIL_ATUALIZADO\][\s\S]*?\[\/PERFIL_ATUALIZADO\]/g, '')
  // Remove partial opening tags at the end (during streaming)
  cleaned = cleaned.replace(/\[PERFIL_(?:EXTRAIDO|ATUALIZADO)\][\s\S]*$/, '')
  // Remove trailing partial tag start
  cleaned = cleaned.replace(/\[PERFIL_(?:EXTRAIDO|ATUALIZADO)?$/, '')
  cleaned = cleaned.replace(/\[PERFIL_?$/, '')
  cleaned = cleaned.replace(/\[PERF?$/, '')
  cleaned = cleaned.replace(/\[PE?$/, '')
  cleaned = cleaned.replace(/\[P?$/, '')
  return cleaned.trim()
}

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const loadMessages = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(
        (data as Message[]).map((m) =>
          m.role === 'assistant'
            ? { ...m, content: cleanProfileTags(m.content) }
            : m
        )
      )
    }
  }, [conversationId])

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  const sendMessage = useCallback(
    async (text: string) => {
      // Reset error state on new send
      setError(null)
      setLastUserMessage(text)

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

      // Abort any previous request and create a new controller
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      let fullText = ''
      let aborted = false

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, message: text }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          setError('Nao foi possivel obter resposta do servidor. Tente novamente.')
          setIsStreaming(false)
          return
        }

        // 3. Read SSE stream using TextDecoderStream
        const reader = response.body
          .pipeThrough(new TextDecoderStream())
          .getReader()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += value
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue

            try {
              const data = JSON.parse(line.slice(6))

              if (data.error) {
                setError('Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.')
                setStreamingText('')
                return
              }

              if (data.done) {
                // Final: add assistant message to state (cleaned)
                const assistantMsg: Message = {
                  id: crypto.randomUUID(),
                  user_id: '',
                  conversation_id: conversationId,
                  role: 'assistant',
                  content: cleanProfileTags(fullText),
                  created_at: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, assistantMsg])
                setStreamingText('')
              } else if (data.text) {
                fullText += data.text
                setStreamingText(cleanProfileTags(fullText))
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          aborted = true
          // Preserve whatever streamed so far as a partial assistant message
          const partial = cleanProfileTags(fullText)
          if (partial) {
            const assistantMsg: Message = {
              id: crypto.randomUUID(),
              user_id: '',
              conversation_id: conversationId,
              role: 'assistant',
              content: partial,
              created_at: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, assistantMsg])
          }
          setStreamingText('')
        } else {
          setError('Erro de conexao. Verifique sua internet e tente novamente.')
          setStreamingText('')
        }
      } finally {
        setIsStreaming(false)
        if (!aborted && abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }
      }
    },
    [conversationId]
  )

  const retry = useCallback(() => {
    if (!lastUserMessage) return
    // Remove the last user message we had optimistically added so sendMessage re-adds it
    setMessages((prev) => {
      // Find the last user message with matching content and strip it
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === 'user' && prev[i].content === lastUserMessage) {
          return [...prev.slice(0, i), ...prev.slice(i + 1)]
        }
      }
      return prev
    })
    setError(null)
    sendMessage(lastUserMessage)
  }, [lastUserMessage, sendMessage])

  return {
    messages,
    setMessages,
    isStreaming,
    streamingText,
    error,
    sendMessage,
    loadMessages,
    stopStreaming,
    retry,
  }
}
