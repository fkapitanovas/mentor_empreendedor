'use client'

interface StreamingMessageProps {
  text: string
}

export function StreamingMessage({ text }: StreamingMessageProps) {
  const paragraphs = text.split('\n\n')

  return (
    <div className="flex gap-3 px-4 py-2 justify-start animate-message-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
        M
      </div>
      <div className="max-w-[min(720px,85%)] rounded-2xl rounded-tl-md border border-border bg-secondary px-4 py-3 text-sm text-secondary-foreground" style={{ lineHeight: '1.7' }}>
        {paragraphs.map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : undefined}>
            {paragraph}
          </p>
        ))}
        <span className="ml-0.5 inline-block animate-cursor-blink">|</span>
      </div>
    </div>
  )
}
