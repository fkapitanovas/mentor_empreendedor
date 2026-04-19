'use client'

interface StreamingMessageProps {
  text: string
}

export function StreamingMessage({ text }: StreamingMessageProps) {
  const paragraphs = text.split('\n\n')

  return (
    <div className="flex gap-3 px-4 py-2 justify-start">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-xs font-bold text-white">
        M
      </div>
      <div className="max-w-[720px] rounded-2xl bg-muted/50 px-4 py-2.5 text-sm leading-relaxed text-foreground">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : undefined}>
            {paragraph}
          </p>
        ))}
        <span className="inline-block motion-safe:animate-pulse">&#x2588;</span>
      </div>
    </div>
  )
}
