'use client'

import { cn } from '@/lib/utils'
import type { Message } from '@/types/database'

function formatContent(content: string) {
  // Split by double newlines into paragraphs, then handle bold
  return content.split('\n\n').map((paragraph, i) => {
    const lines = paragraph.split('\n')
    return (
      <p key={i} className={i > 0 ? 'mt-3' : undefined}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {renderBold(line)}
          </span>
        ))}
      </p>
    )
  })
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'flex gap-3 px-4 py-2',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-xs font-bold text-white">
          M
        </div>
      )}
      <div
        className={cn(
          'max-w-[720px] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isAssistant
            ? 'bg-muted/50 text-foreground'
            : 'bg-primary/10 text-foreground'
        )}
      >
        {formatContent(message.content)}
      </div>
      {!isAssistant && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
          U
        </div>
      )}
    </div>
  )
}
