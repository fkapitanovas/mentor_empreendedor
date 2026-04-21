'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { MessageBubble } from './message-bubble'
import { StreamingMessage } from './streaming-message'
import { TypingIndicator } from './typing-indicator'
import type { Message } from '@/types/database'

const SUGGESTIONS = [
  'Como precificar meu produto?',
  'Devo me formalizar como MEI?',
  'Como atrair mais clientes?',
]

interface MessageListProps {
  messages: Message[]
  streamingText: string
  isStreaming: boolean
  error?: string | null
  onRetry?: () => void
  onSendSuggestion?: (text: string) => void
  onViewportReady?: (el: HTMLDivElement | null) => void
}

export function MessageList({
  messages,
  streamingText,
  isStreaming,
  error,
  onRetry,
  onSendSuggestion,
  onViewportReady,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRootRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const shouldStickRef = useRef(true)

  // Locate the Base UI viewport element once the ScrollArea mounts and attach scroll listener
  useEffect(() => {
    const root = scrollRootRef.current
    if (!root) return
    const el = root.querySelector<HTMLDivElement>(
      '[data-slot="scroll-area-viewport"]'
    )
    viewportRef.current = el
    onViewportReady?.(el)

    if (!el) return
    const handleScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      shouldStickRef.current = distanceFromBottom < 80
    }
    el.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      el.removeEventListener('scroll', handleScroll)
      onViewportReady?.(null)
    }
  }, [onViewportReady])

  useEffect(() => {
    if (shouldStickRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingText, isStreaming])

  if (messages.length === 0 && !isStreaming && !error) {
    return (
      <div
        ref={scrollRootRef}
        className="flex flex-1 items-center justify-center p-8"
        role="log"
        aria-live="polite"
        aria-busy={isStreaming}
        aria-label="Conversa com Max Impulso"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[image:var(--gradient-brand)] text-2xl font-bold text-white font-heading">
            M
          </div>
          <div>
            <h2 className="font-heading text-2xl font-extrabold bg-clip-text text-transparent bg-[image:var(--gradient-brand-text)]">
              Ola! Sou o Max Impulso
            </h2>
            <p className="mt-1 text-base text-muted-foreground">
              Seu mentor de negocios
            </p>
          </div>
          {onSendSuggestion && (
            <div className="flex flex-col gap-2 mt-2 w-full max-w-sm">
              {SUGGESTIONS.map((text, i) => (
                <button
                  key={text}
                  onClick={() => onSendSuggestion(text)}
                  className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground transition-all duration-150 hover:border-primary/30 hover:bg-primary/5 text-left animate-message-in"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'backwards' }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRootRef}
      className="flex min-h-0 flex-1 flex-col"
    >
      <ScrollArea
        className="flex-1"
        role="log"
        aria-live="polite"
        aria-busy={isStreaming}
        aria-label="Conversa com Max Impulso"
      >
        <div className="mx-auto max-w-3xl py-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isStreaming && streamingText && <StreamingMessage text={streamingText} />}
          {isStreaming && !streamingText && <TypingIndicator />}
          {error && (
            <div
              className="mx-4 my-3 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm"
              role="alert"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <div className="flex-1">
                <p className="text-foreground">{error}</p>
                {onRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={onRetry}
                  >
                    Tentar novamente
                  </Button>
                )}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
