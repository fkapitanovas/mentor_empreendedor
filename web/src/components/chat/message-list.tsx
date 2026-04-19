'use client'

import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './message-bubble'
import { StreamingMessage } from './streaming-message'
import { TypingIndicator } from './typing-indicator'
import type { Message } from '@/types/database'

interface MessageListProps {
  messages: Message[]
  streamingText: string
  isStreaming: boolean
}

export function MessageList({ messages, streamingText, isStreaming }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, isStreaming])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-2xl font-bold text-white">
            M
          </div>
          <h2 className="bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-xl font-semibold text-transparent">
            Ola! Sou o Max Impulso, seu mentor de negocios.
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Como posso ajudar voce hoje? Pergunte sobre gestao, financas, marketing, ou qualquer desafio do seu negocio.
          </p>
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
