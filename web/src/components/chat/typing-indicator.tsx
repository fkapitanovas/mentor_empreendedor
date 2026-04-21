'use client'

export function TypingIndicator() {
  return (
    <div
      className="flex gap-3 px-4 py-2 justify-start animate-message-in"
      role="status"
    >
      <span className="sr-only">Max esta digitando...</span>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2px] border-ink bg-[var(--sun)] text-on-bright text-xs font-extrabold" aria-hidden="true">
        M
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border-[2px] border-ink bg-card px-4 py-3" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--coral)] [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--coral)] [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--coral)] [animation-delay:300ms]" />
      </div>
    </div>
  )
}
