'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  onSendSuggestion?: (text: string) => void
}

export function MessageList({ messages, streamingText, isStreaming, onSendSuggestion }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isStreaming])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white font-heading">
            M
          </div>
          <div>
            <h2 className="font-heading text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
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
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl py-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isStreaming && streamingText && <StreamingMessage text={streamingText} />}
        {isStreaming && !streamingText && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
