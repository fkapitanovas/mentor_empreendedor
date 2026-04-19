'use client'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-2 justify-start">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-xs font-bold text-white">
        M
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-muted/50 px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
    </div>
  )
}
