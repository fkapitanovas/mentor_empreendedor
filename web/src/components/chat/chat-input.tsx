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
    <div className="bg-background px-4 py-3" style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.03)' }}>
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
          className="flex-1 resize-none rounded-2xl border-[1.5px] border-input bg-card px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground transition-colors duration-150 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ touchAction: 'manipulation', minHeight: '44px' }}
          aria-label="Mensagem para o Max Impulso"
        />
        <Button
          onClick={handleButtonClick}
          disabled={buttonDisabled}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-[image:var(--gradient-brand)] text-white transition-all duration-150 hover:scale-105 hover:shadow-md disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label={canStop ? 'Parar resposta' : 'Enviar mensagem'}
        >
          {canStop ? <Square className="size-5" /> : <ArrowUp className="size-5" />}
        </Button>
      </div>
    </div>
  )
}
