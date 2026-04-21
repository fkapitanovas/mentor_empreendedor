'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { AlertCircle, ChevronsUp, ChevronsDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageBubble } from './message-bubble'
import { StreamingMessage } from './streaming-message'
import { TypingIndicator } from './typing-indicator'
import type { Message } from '@/types/database'

const SUGGESTIONS = [
  'Como precificar sem perder margem?',
  'Devo formalizar MEI agora?',
  'Como atrair mais clientes?',
  'Preciso de um sócio?',
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
  const [showTop, setShowTop] = useState(false)
  const [showBottom, setShowBottom] = useState(false)

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
      // FAB visibility: mostra só quando há ~400px para navegar em cada direção
      setShowTop(el.scrollTop > 400)
      setShowBottom(distanceFromBottom > 400)
    }
    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      el.removeEventListener('scroll', handleScroll)
      onViewportReady?.(null)
    }
  }, [onViewportReady, messages.length])

  const scrollToTop = useCallback(() => {
    viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToBottom = useCallback(() => {
    const el = viewportRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (shouldStickRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingText, isStreaming])

  if (messages.length === 0 && !isStreaming && !error) {
    return (
      <div
        ref={scrollRootRef}
        className="flex flex-1 items-start justify-start p-8 md:p-12"
        role="log"
        aria-live="polite"
        aria-busy={isStreaming}
        aria-label="Conversa com Max Impulso"
      >
        <div className="w-full max-w-3xl">
          <h1 className="font-heading text-[clamp(3rem,8vw,5.5rem)] font-extrabold leading-[0.92] tracking-tight text-ink">
            Oi<span className="animate-wave" aria-hidden="true">👋🏽</span>
            <br />
            <span className="inline-block text-transparent italic" style={{ WebkitTextStroke: '3px var(--ink)' }}>
              Sou o Max.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground">
            Seu mentor de negócios. Pergunta livre — ou escolhe uma:
          </p>
          {onSendSuggestion && (
            <div className="mt-8 flex flex-wrap gap-3">
              {SUGGESTIONS.map((text, i) => {
                const variants = [
                  'bg-[var(--sun)] text-ink -rotate-[2deg]',
                  'bg-[var(--coral)] text-[var(--cream)] rotate-[1.5deg]',
                  'bg-primary text-primary-foreground -rotate-[1deg]',
                ]
                return (
                  <button
                    key={text}
                    onClick={() => onSendSuggestion(text)}
                    className={`rounded-full border-[2px] border-ink px-5 py-2.5 font-heading text-[15px] font-semibold shadow-hard-sm transition-all duration-200 hover:rotate-0 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink)] animate-message-in ${variants[i % 3]}`}
                    style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'backwards' }}
                  >
                    {text}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={scrollRootRef}
      className="relative flex min-h-0 flex-1 flex-col"
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

      {/* Atalhos de scroll para conversas longas */}
      <div
        className="pointer-events-none absolute bottom-4 right-3 z-20 flex flex-col gap-2 md:bottom-6 md:right-6"
        aria-hidden={!showTop && !showBottom}
      >
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Ir para o início da conversa"
          className={cn(
            'pointer-events-auto flex size-11 items-center justify-center rounded-full border-[2px] border-ink bg-card text-ink shadow-hard-sm transition-all duration-200 hover:bg-[var(--sun)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] focus-visible:bg-[var(--sun)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
            showTop
              ? 'opacity-100 scale-100'
              : 'pointer-events-none opacity-0 scale-90'
          )}
          tabIndex={showTop ? 0 : -1}
        >
          <ChevronsUp className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Ir para o final da conversa"
          className={cn(
            'pointer-events-auto flex size-11 items-center justify-center rounded-full border-[2px] border-ink bg-card text-ink shadow-hard-sm transition-all duration-200 hover:bg-[var(--sun)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] focus-visible:bg-[var(--sun)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
            showBottom
              ? 'opacity-100 scale-100'
              : 'pointer-events-none opacity-0 scale-90'
          )}
          tabIndex={showBottom ? 0 : -1}
        >
          <ChevronsDown className="size-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
