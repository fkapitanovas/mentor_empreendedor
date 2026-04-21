'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (text: string) => void
  isStreaming: boolean
  onStop?: () => void
}

export function ChatInput({ onSend, isStreaming, onStop }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Textarea is always disabled while streaming. Button behavior depends on onStop support.
  const canStop = isStreaming && Boolean(onStop)
  const textareaDisabled = isStreaming

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, isStreaming, onSend])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const handleInput = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  const handleButtonClick = useCallback(() => {
    if (canStop) {
      onStop?.()
      return
    }
    handleSend()
  }, [canStop, onStop, handleSend])

  // Button disabled only when not streaming and input empty; during streaming with stop, enabled
  const buttonDisabled = canStop ? false : (isStreaming || !value.trim())

  return (
    <div className="border-t-[2px] border-ink bg-card px-4 py-3">
      <div className="mx-auto flex max-w-[720px] items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            handleInput()
          }}
          onKeyDown={handleKeyDown}
          placeholder="O que voce gostaria de saber?"
          disabled={textareaDisabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border-[2px] border-ink bg-popover px-4 py-3 font-sans text-[15px] leading-relaxed placeholder:text-muted-foreground focus-visible:border-accent focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{ touchAction: 'manipulation', minHeight: '48px' }}
          aria-label="Mensagem para o Max Impulso"
        />
        <Button
          onClick={handleButtonClick}
          disabled={buttonDisabled}
          size="icon"
          className={`h-12 w-12 shrink-0 rounded-full border-[2px] border-ink ${canStop ? 'bg-[var(--coral)] text-[var(--cream)]' : 'bg-[var(--sun)] text-ink'} hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-0 focus-visible:border-accent disabled:opacity-40 transition-all`}
          aria-label={canStop ? 'Parar resposta' : 'Enviar mensagem'}
        >
          {canStop ? <Square className="size-5" /> : <ArrowUp className="size-5" />}
        </Button>
      </div>
    </div>
  )
}
