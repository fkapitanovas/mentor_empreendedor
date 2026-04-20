'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (text: string) => void
  disabled: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, disabled, onSend])

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
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-2xl border-[1.5px] border-input bg-card px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground transition-colors duration-150 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ touchAction: 'manipulation', minHeight: '44px' }}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white transition-all duration-150 hover:scale-105 hover:shadow-md hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-30"
          aria-label="Enviar mensagem"
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>
    </div>
  )
}
