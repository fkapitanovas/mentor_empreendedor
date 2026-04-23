'use client'

import { useCallback, useEffect, useState } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'

interface MicButtonProps {
  onTranscribed: (text: string) => void
  disabled?: boolean
}

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function MicButton({ onTranscribed, disabled = false }: MicButtonProps) {
  const recorder = useVoiceRecorder()
  const [transcribing, setTranscribing] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const ok =
      typeof MediaRecorder !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia
    setSupported(ok)
  }, [])

  useEffect(() => {
    if (!recorder.error) return
    if (recorder.error === 'permission_denied') {
      toast.error('Para usar o microfone, libere o acesso nas configuracoes do navegador.')
    } else if (recorder.error === 'no_microphone') {
      toast.error('Nenhum microfone encontrado neste dispositivo.')
    } else if (recorder.error === 'browser_unsupported') {
      toast.error('Seu navegador nao suporta gravacao de audio.')
    } else {
      toast.error('Nao foi possivel iniciar a gravacao. Tenta de novo.')
    }
  }, [recorder.error])

  const handleClick = useCallback(async () => {
    if (transcribing) return

    if (recorder.state === 'idle') {
      await recorder.startRecording()
      return
    }

    if (recorder.state === 'recording') {
      const blob = await recorder.stopRecording()
      if (!blob) {
        toast.error('Gravacao muito curta — tenta falar por mais tempo.')
        return
      }

      setTranscribing(true)
      try {
        const formData = new FormData()
        formData.append('audio', blob, 'recording.webm')

        const response = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string
          }
          if (response.status === 401) {
            toast.error('Sessao expirada. Faca login novamente.')
          } else if (response.status === 413) {
            toast.error('Audio muito longo. Tenta quebrar em pedacos menores.')
          } else if (response.status === 429) {
            toast.error('Muitas gravacoes seguidas. Aguarda uns segundos.')
          } else if (payload.error === 'audio_too_short') {
            toast.error('Gravacao muito curta — tenta falar por mais tempo.')
          } else {
            toast.error('Nao consegui transcrever seu audio. Tenta digitar ou tenta de novo.')
          }
          return
        }

        const data = (await response.json()) as { text?: string }
        if (data.text && data.text.trim()) {
          onTranscribed(data.text.trim())
        } else {
          toast.error('Nao entendi o audio. Tenta falar mais claramente.')
        }
      } catch {
        toast.error('Sem conexao. Tenta de novo em instantes.')
      } finally {
        setTranscribing(false)
      }
    }
  }, [recorder, transcribing, onTranscribed])

  if (!supported) return null

  const buttonState: 'idle' | 'recording' | 'transcribing' = transcribing
    ? 'transcribing'
    : recorder.state === 'recording'
    ? 'recording'
    : 'idle'

  const isDisabled = disabled || buttonState === 'transcribing'

  const bgClass =
    buttonState === 'recording'
      ? 'bg-[var(--coral)] text-[var(--cream)] animate-pulse'
      : buttonState === 'transcribing'
      ? 'bg-[var(--sun)] text-on-bright'
      : 'bg-popover text-foreground'

  const icon =
    buttonState === 'recording' ? (
      <Square className="size-5" />
    ) : buttonState === 'transcribing' ? (
      <Loader2 className="size-5 animate-spin" />
    ) : (
      <Mic className="size-5" />
    )

  const ariaLabel =
    buttonState === 'recording'
      ? `Parar gravacao (${formatTimer(recorder.elapsedMs)} gravados)`
      : buttonState === 'transcribing'
      ? 'Transcrevendo audio, aguarda'
      : 'Gravar mensagem de audio'

  return (
    <div className="relative flex items-center gap-2">
      {buttonState === 'recording' && (
        <span
          className="font-sans text-sm tabular-nums text-[var(--coral)]"
          aria-live="polite"
        >
          {formatTimer(recorder.elapsedMs)}
        </span>
      )}
      <Button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        size="icon"
        className={`h-12 w-12 shrink-0 rounded-full border-[2px] border-ink ${bgClass} hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-0 focus-visible:border-accent disabled:opacity-40 transition-all`}
        aria-label={ariaLabel}
      >
        {icon}
      </Button>
    </div>
  )
}
