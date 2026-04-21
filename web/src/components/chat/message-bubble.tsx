'use client'

import { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/database'

function formatContent(content: string, isAssistant: boolean) {
  return content.split('\n\n').map((paragraph, i) => {
    const trimmed = paragraph.trim()

    if (isAssistant && trimmed.startsWith('### ')) {
      return (
        <p key={i} className={cn('font-heading text-[15px] font-semibold', i > 0 && 'mt-4')}>
          {renderInline(trimmed.slice(4), isAssistant)}
        </p>
      )
    }

    const lines = trimmed.split('\n')
    return (
      <p key={i} className={i > 0 ? 'mt-3' : undefined}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {renderInline(line, isAssistant)}
          </span>
        ))}
      </p>
    )
  })
}

function renderInline(text: string, isAssistant: boolean) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={isAssistant ? 'font-semibold text-primary' : 'font-semibold'}>
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

interface MessageBubbleProps {
  message: Message
}

function MessageBubbleInner({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  const rendered = useMemo(
    () => formatContent(message.content, isAssistant),
    [message.content, isAssistant]
  )

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-2 animate-message-in',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[image:var(--gradient-brand)] text-xs font-bold text-white">
          M
        </div>
      )}
      <div
        className={cn(
          'rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isAssistant
            ? 'max-w-[min(720px,85%)] rounded-tl-md border border-border bg-secondary text-secondary-foreground'
            : 'max-w-[min(480px,75%)] rounded-tr-md bg-[image:var(--gradient-brand-strong)] text-white'
        )}
        style={{ lineHeight: '1.7' }}
      >
        {rendered}
      </div>
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleInner, (prev, next) => {
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content
  )
})
