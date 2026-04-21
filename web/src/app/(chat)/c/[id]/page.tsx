'use client'

import { useCallback, useEffect, useRef, use } from 'react'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useChat } from '@/hooks/use-chat'

const SCROLL_KEY_PREFIX = 'scroll-conv-'

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const {
    messages,
    isStreaming,
    streamingText,
    error,
    sendMessage,
    loadMessages,
    stopStreaming,
    retry,
  } = useChat(id)

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const scrollRestoredRef = useRef(false)

  // Load messages and schedule scroll restore once they render
  useEffect(() => {
    let cancelled = false
    scrollRestoredRef.current = false
    loadMessages().then(() => {
      if (cancelled) return
      // Restore scroll on next frame to allow DOM to paint
      requestAnimationFrame(() => {
        if (cancelled || scrollRestoredRef.current) return
        const saved = sessionStorage.getItem(`${SCROLL_KEY_PREFIX}${id}`)
        const el = viewportRef.current
        if (saved && el) {
          const top = Number(saved)
          if (!Number.isNaN(top)) {
            el.scrollTop = top
          }
        }
        scrollRestoredRef.current = true
      })
    })
    return () => {
      cancelled = true
    }
  }, [id, loadMessages])

  // On unmount (or id change), save the current scroll position
  useEffect(() => {
    return () => {
      const el = viewportRef.current
      if (el) {
        sessionStorage.setItem(`${SCROLL_KEY_PREFIX}${id}`, String(el.scrollTop))
      }
    }
  }, [id])

  const handleViewportReady = useCallback((el: HTMLDivElement | null) => {
    viewportRef.current = el
  }, [])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList
        messages={messages}
        streamingText={streamingText}
        isStreaming={isStreaming}
        error={error}
        onRetry={retry}
        onSendSuggestion={sendMessage}
        onViewportReady={handleViewportReady}
      />
      <ChatInput
        onSend={sendMessage}
        isStreaming={isStreaming}
        onStop={stopStreaming}
      />
    </div>
  )
}
