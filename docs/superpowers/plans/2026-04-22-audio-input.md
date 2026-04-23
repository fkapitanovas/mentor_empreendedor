# Input de Áudio via Groq Whisper — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar input de áudio no chat do Max Impulso — empreendedor toca no mic, grava até 2min, áudio é transcrito via Groq Whisper Turbo, texto preenche o textarea pra revisão/edição antes do envio.

**Architecture:** Client grava com `MediaRecorder` (WebM/Opus com fallback MP4); ao parar, envia Blob pra `/api/transcribe` via multipart; backend valida sessão Supabase, chama `groq-sdk` com `whisper-large-v3-turbo` (lang='pt'), retorna `{text}`; client anexa ao textarea. Zero storage de áudio. Toasts via `sonner` (já instalado). Feature flag via `NEXT_PUBLIC_VOICE_ENABLED` (client detecta; se falso, botão não renderiza).

**Tech Stack:** Next.js 16 App Router (Node runtime), React 19, TypeScript, `groq-sdk` (novo), MediaRecorder API, Supabase Auth SSR, sonner (toasts), Tailwind v4 + Tropical Maximalista.

**Spec de referência:** `docs/superpowers/specs/2026-04-22-audio-input-design.md` (commit `2506704`).

---

## File Structure

Todos os arquivos dentro de `/Users/kapi/mentor_empreendedor/web/`.

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `package.json` | Modificar | Adiciona `groq-sdk` como dependency |
| `.env.local.example` | Modificar | Documenta `GROQ_API_KEY` + `NEXT_PUBLIC_VOICE_ENABLED` |
| `src/lib/groq.ts` | **CRIAR** | Wrapper minimalista do SDK Groq (lazy init + `isGroqConfigured`) |
| `src/app/api/transcribe/route.ts` | **CRIAR** | POST multipart → valida sessão → Groq → `{text}` |
| `src/hooks/use-voice-recorder.ts` | **CRIAR** | Hook encapsulando MediaRecorder, timer, cap 2min, erros |
| `src/components/chat/mic-button.tsx` | **CRIAR** | Botão mic com 3 estados visuais + fetch pra /api/transcribe |
| `src/components/chat/chat-input.tsx` | Modificar | Adiciona `<MicButton>` entre textarea e send; handler que anexa transcrição no value |

---

## Convenções e comandos

Sempre do diretório `web/`:

```bash
cd /Users/kapi/mentor_empreendedor/web
npx tsc --noEmit          # typecheck
npm run build             # build prod local
npm run dev               # dev server http://localhost:3000
vercel --prod --yes       # deploy (DO diretorio web/)
```

Commits em pt-BR, título curto, corpo com "por que". Sem `--no-verify`. `handleSend` existente em chat-input preserva comportamento atual — qualquer regressão no fluxo só-texto é bug.

---

## Task 1: Dependências e env

**Files:**
- Modify: `web/package.json`
- Modify: `web/.env.local.example`
- Modify: `web/package-lock.json` (via npm install)

- [ ] **Step 1.1: Instalar groq-sdk**

Run: `cd /Users/kapi/mentor_empreendedor/web && npm install groq-sdk`
Expected: package adicionado em dependencies, sem warnings críticos. Vai baixar ~300KB.

- [ ] **Step 1.2: Atualizar `.env.local.example`**

Arquivo atual tem 4 linhas. Acrescentar 2 linhas ao final.

Edit `/Users/kapi/mentor_empreendedor/web/.env.local.example`:

```
OLD:
ANTHROPIC_API_KEY=

NEW:
ANTHROPIC_API_KEY=

# Groq API key para transcricao de audio via Whisper Turbo
# https://console.groq.com — free tier OK, modelo usado: whisper-large-v3-turbo
GROQ_API_KEY=

# Habilita o botao de microfone no chat. Setar "true" apenas se GROQ_API_KEY
# estiver configurada (no Vercel production + preview). Qualquer outro valor
# esconde o botao (graceful degradation).
NEXT_PUBLIC_VOICE_ENABLED=false
```

- [ ] **Step 1.3: Typecheck pra confirmar que nada quebrou**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 1.4: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/package.json web/package-lock.json web/.env.local.example
git commit -m "$(cat <<'EOF'
chore(deps): adiciona groq-sdk para transcricao de audio

groq-sdk (~300KB) permite chamar Groq Whisper Turbo no endpoint
/api/transcribe. Env vars novas:

- GROQ_API_KEY: chave server-side do Groq (console.groq.com)
- NEXT_PUBLIC_VOICE_ENABLED: feature flag client-side. Usuario seta
  "true" quando GROQ_API_KEY estiver nos ambientes Vercel.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Wrapper do cliente Groq

**Files:**
- Create: `web/src/lib/groq.ts`

- [ ] **Step 2.1: Criar o wrapper**

Write em `/Users/kapi/mentor_empreendedor/web/src/lib/groq.ts`:

```typescript
import Groq from 'groq-sdk'

let cachedClient: Groq | null = null

export function getGroqClient(): Groq {
  if (cachedClient) return cachedClient
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured')
  }
  cachedClient = new Groq({ apiKey })
  return cachedClient
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY)
}
```

- [ ] **Step 2.2: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0. O `groq-sdk` tem tipos nativos, então `import Groq` resolve corretamente.

- [ ] **Step 2.3: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/lib/groq.ts
git commit -m "$(cat <<'EOF'
feat(audio): wrapper lazy do cliente Groq

getGroqClient() faz init preguicoso e cacheia a instancia; lanca erro
claro se GROQ_API_KEY nao estiver setada. isGroqConfigured() expoe um
check barato sem inicializar nada.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Endpoint `/api/transcribe`

**Files:**
- Create: `web/src/app/api/transcribe/route.ts`

- [ ] **Step 3.1: Criar o endpoint**

Write em `/Users/kapi/mentor_empreendedor/web/src/app/api/transcribe/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { getGroqClient } from '@/lib/groq'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_AUDIO_BYTES = 10 * 1024 * 1024
const MIN_AUDIO_BYTES = 1_000

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonResponse({ error: 'unauthorized' }, 401)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonResponse({ error: 'invalid_body' }, 400)
  }

  const audio = formData.get('audio')
  if (!(audio instanceof Blob)) {
    return jsonResponse({ error: 'no_audio' }, 400)
  }

  if (audio.size > MAX_AUDIO_BYTES) {
    return jsonResponse({ error: 'audio_too_large' }, 413)
  }

  if (audio.size < MIN_AUDIO_BYTES) {
    return jsonResponse({ error: 'audio_too_short' }, 400)
  }

  const t0 = Date.now()
  try {
    const groq = getGroqClient()
    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: 'whisper-large-v3-turbo',
      language: 'pt',
      temperature: 0,
      response_format: 'json',
    })

    const latencyMs = Date.now() - t0
    console.log(
      JSON.stringify({
        event: 'transcribe',
        userId: user.id,
        audioBytes: audio.size,
        charCount: transcription.text.length,
        groqLatencyMs: latencyMs,
        success: true,
      }),
    )

    return jsonResponse({ text: transcription.text }, 200)
  } catch (err) {
    const latencyMs = Date.now() - t0
    const message = err instanceof Error ? err.message : String(err)
    console.error(
      JSON.stringify({
        event: 'transcribe',
        userId: user.id,
        audioBytes: audio.size,
        groqLatencyMs: latencyMs,
        error: message,
        success: false,
      }),
    )

    if (message.includes('GROQ_API_KEY not configured')) {
      return jsonResponse({ error: 'not_configured' }, 503)
    }
    if (message.includes('429') || message.toLowerCase().includes('rate')) {
      return jsonResponse({ error: 'rate_limited' }, 429)
    }
    return jsonResponse({ error: 'transcription_failed' }, 502)
  }
}
```

- [ ] **Step 3.2: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 3.3: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/app/api/transcribe/route.ts
git commit -m "$(cat <<'EOF'
feat(audio): endpoint /api/transcribe com Groq Whisper Turbo

POST multipart recebe Blob de audio (max 10MB, min 1KB), valida
sessao Supabase, chama Groq whisper-large-v3-turbo com language='pt',
retorna {text}.

Runtime nodejs (SDK Groq precisa Node APIs). maxDuration 60s (sobra
3x sobre o cap de 2min gravado pelo client).

Observabilidade: log estruturado JSON com userId, audioBytes,
charCount, groqLatencyMs e success. Texto transcrito NAO vai pro
log (privacy).

Erros mapeados:
- 401 unauthorized (sem sessao)
- 400 no_audio / audio_too_short / invalid_body
- 413 audio_too_large
- 429 rate_limited
- 502 transcription_failed
- 503 not_configured

Zero storage de audio.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Hook `useVoiceRecorder`

**Files:**
- Create: `web/src/hooks/use-voice-recorder.ts`

Encapsula toda a complexidade de MediaRecorder. Interface estável: `{ state, elapsedMs, error, startRecording, stopRecording, cancelRecording }`.

- [ ] **Step 4.1: Criar o hook**

Write em `/Users/kapi/mentor_empreendedor/web/src/hooks/use-voice-recorder.ts`:

```typescript
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'stopping'

export interface UseVoiceRecorderReturn {
  state: RecorderState
  elapsedMs: number
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  cancelRecording: () => void
}

const MAX_DURATION_MS = 120_000
const MIN_DURATION_MS = 1_000
const TICK_MS = 100

const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/mp4;codecs=mp4a.40.2',
  '',
]

function pickSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  for (const mime of MIME_CANDIDATES) {
    if (!mime) return ''
    if (MediaRecorder.isTypeSupported(mime)) return mime
  }
  return ''
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const tickRef = useRef<number | null>(null)
  const startedAtRef = useRef<number>(0)
  const stopPromiseRef = useRef<{
    resolve: (blob: Blob | null) => void
    reject: (err: Error) => void
  } | null>(null)

  const cleanup = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    recorderRef.current = null
    chunksRef.current = []
    stopPromiseRef.current = null
    setElapsedMs(0)
    setState('idle')
  }, [])

  useEffect(() => {
    // Cleanup no unmount: fecha stream, aborta recording
    return () => {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        try {
          recorderRef.current.stop()
        } catch {
          // ignorar
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (tickRef.current !== null) {
        window.clearInterval(tickRef.current)
      }
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      cleanup()
      return null
    }
    if (state === 'stopping') {
      // Idempotente: se ja estamos parando, espera a promise corrente
      return new Promise((resolve) => {
        const check = () => {
          if (state === 'idle') resolve(null)
          else setTimeout(check, 50)
        }
        check()
      })
    }

    setState('stopping')
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }

    return new Promise<Blob | null>((resolve, reject) => {
      stopPromiseRef.current = { resolve, reject }
      try {
        recorder.stop()
      } catch (err) {
        stopPromiseRef.current = null
        cleanup()
        reject(err instanceof Error ? err : new Error(String(err)))
      }
    })
  }, [cleanup, state])

  const startRecording = useCallback(async () => {
    setError(null)
    if (state !== 'idle') return

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('browser_unsupported')
      return
    }

    setState('requesting')

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
    } catch (err) {
      const name = err instanceof Error ? err.name : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError('permission_denied')
      } else if (name === 'NotFoundError') {
        setError('no_microphone')
      } else {
        setError('getusermedia_failed')
      }
      setState('idle')
      return
    }

    const mimeType = pickSupportedMimeType()
    let recorder: MediaRecorder
    try {
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
    } catch {
      stream.getTracks().forEach((t) => t.stop())
      setError('mediarecorder_failed')
      setState('idle')
      return
    }

    streamRef.current = stream
    recorderRef.current = recorder
    chunksRef.current = []

    recorder.addEventListener('dataavailable', (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data)
    })

    recorder.addEventListener('stop', () => {
      const chunks = chunksRef.current
      const type = recorder.mimeType || mimeType || 'audio/webm'
      const blob = chunks.length > 0 ? new Blob(chunks, { type }) : null

      // Se < min duration, devolve null (chamador decide o toast)
      const duration = Date.now() - startedAtRef.current
      const shouldReturnBlob = blob && duration >= MIN_DURATION_MS

      const pending = stopPromiseRef.current
      stopPromiseRef.current = null
      cleanup()
      pending?.resolve(shouldReturnBlob ? blob : null)
    })

    recorder.addEventListener('error', (ev) => {
      const pending = stopPromiseRef.current
      stopPromiseRef.current = null
      cleanup()
      const err = new Error(
        `mediarecorder_error: ${(ev as Event & { error?: Error }).error?.message || 'unknown'}`,
      )
      if (pending) pending.reject(err)
      else setError('mediarecorder_error')
    })

    startedAtRef.current = Date.now()
    setElapsedMs(0)
    recorder.start(250)
    setState('recording')

    tickRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current
      setElapsedMs(elapsed)
      if (elapsed >= MAX_DURATION_MS) {
        // Auto-stop: dispara stop mas nao bloqueia o caller. O consumer
        // deve observar state === 'stopping' ou esperar o elapsedMs chegar
        // no cap — na pratica, o MicButton ja dispara o stop manual.
        if (tickRef.current !== null) {
          window.clearInterval(tickRef.current)
          tickRef.current = null
        }
        if (recorderRef.current?.state === 'recording') {
          setState('stopping')
          try {
            recorderRef.current.stop()
          } catch {
            // ignorar
          }
        }
      }
    }, TICK_MS)
  }, [cleanup, state])

  const cancelRecording = useCallback(() => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current)
      tickRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop()
      } catch {
        // ignorar
      }
    }
    stopPromiseRef.current?.resolve(null)
    stopPromiseRef.current = null
    cleanup()
    setError(null)
  }, [cleanup])

  return {
    state,
    elapsedMs,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
```

- [ ] **Step 4.2: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0. MediaRecorder/MediaStream são tipados pelo DOM lib de TypeScript automaticamente.

- [ ] **Step 4.3: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/hooks/use-voice-recorder.ts
git commit -m "$(cat <<'EOF'
feat(audio): hook useVoiceRecorder encapsulando MediaRecorder

Interface estavel: { state, elapsedMs, error, startRecording,
stopRecording, cancelRecording }. Estados: idle | requesting |
recording | stopping.

- MIME detection: webm/opus → webm → mp4 (Safari iOS <18) → default
- Cap 2min com auto-stop; min 1s (blob < min retorna null)
- Erros tipados por codigo: browser_unsupported, permission_denied,
  no_microphone, getusermedia_failed, mediarecorder_failed,
  mediarecorder_error
- Cleanup no unmount fecha stream e aborta recording
- Audio constraints: echoCancellation + noiseSuppression + autoGainControl

Consumers nao precisam saber nada sobre MediaRecorder API.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Componente `MicButton`

**Files:**
- Create: `web/src/components/chat/mic-button.tsx`

- [ ] **Step 5.1: Criar o componente**

Write em `/Users/kapi/mentor_empreendedor/web/src/components/chat/mic-button.tsx`:

```typescript
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
    // Detecta suporte de browser em mount (client-only)
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
```

- [ ] **Step 5.2: Typecheck**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit`
Expected: exit 0.

- [ ] **Step 5.3: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/components/chat/mic-button.tsx
git commit -m "$(cat <<'EOF'
feat(audio): componente MicButton com 3 estados visuais

Botao tropical-maximalista (ink 2px, hard shadow hover, rounded-full
size-12) com 3 estados: idle (Mic, bg-popover) → recording (Square,
bg-coral, animate-pulse + timer MM:SS) → transcribing (Loader2
spinning, bg-sun, desabilitado).

Fluxo: tap inicia gravacao → tap de novo para + fetch /api/transcribe
com multipart → onTranscribed(text) callback sobe pro chat-input.

Erros tratados via sonner toasts:
- permission_denied / no_microphone / browser_unsupported
- sessao expirada, audio longo, rate limit, audio curto, falha geral
- sem conexao de rede

Autodetecta suporte de browser em mount — se nao suporta, nao renderiza.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Integrar `MicButton` no `chat-input.tsx`

**Files:**
- Modify: `web/src/components/chat/chat-input.tsx`

- [ ] **Step 6.1: Atualizar o arquivo completo**

O arquivo atual tem 89 linhas. Substituindo por versão que inclui MicButton + handler de transcrição.

Read `/Users/kapi/mentor_empreendedor/web/src/components/chat/chat-input.tsx` (já lido antes no design).

Edit — substituir todo o componente:

```
OLD:
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
          placeholder="O que você gostaria de saber?"
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
          className={`h-12 w-12 shrink-0 rounded-full border-[2px] border-ink ${canStop ? 'bg-[var(--coral)] text-[var(--cream)]' : 'bg-[var(--sun)] text-on-bright'} hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-0 focus-visible:border-accent disabled:opacity-40 transition-all`}
          aria-label={canStop ? 'Parar resposta' : 'Enviar mensagem'}
        >
          {canStop ? <Square className="size-5" /> : <ArrowUp className="size-5" />}
        </Button>
      </div>
    </div>
  )
}

NEW:
'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MicButton } from './mic-button'

interface ChatInputProps {
  onSend: (text: string) => void
  isStreaming: boolean
  onStop?: () => void
}

const VOICE_ENABLED = process.env.NEXT_PUBLIC_VOICE_ENABLED === 'true'

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

  const handleTranscribed = useCallback((text: string) => {
    setValue((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))
    // Foco + cursor ao final + re-run auto-resize
    setTimeout(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }, 0)
  }, [])

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
          placeholder="O que você gostaria de saber?"
          disabled={textareaDisabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border-[2px] border-ink bg-popover px-4 py-3 font-sans text-[15px] leading-relaxed placeholder:text-muted-foreground focus-visible:border-accent focus-visible:shadow-[4px_4px_0_var(--coral)] focus-visible:-translate-x-0.5 focus-visible:-translate-y-0.5 focus-visible:outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{ touchAction: 'manipulation', minHeight: '48px' }}
          aria-label="Mensagem para o Max Impulso"
        />
        {VOICE_ENABLED && (
          <MicButton onTranscribed={handleTranscribed} disabled={isStreaming} />
        )}
        <Button
          onClick={handleButtonClick}
          disabled={buttonDisabled}
          size="icon"
          className={`h-12 w-12 shrink-0 rounded-full border-[2px] border-ink ${canStop ? 'bg-[var(--coral)] text-[var(--cream)]' : 'bg-[var(--sun)] text-on-bright'} hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:ring-0 focus-visible:border-accent disabled:opacity-40 transition-all`}
          aria-label={canStop ? 'Parar resposta' : 'Enviar mensagem'}
        >
          {canStop ? <Square className="size-5" /> : <ArrowUp className="size-5" />}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6.2: Typecheck + build**

Run: `cd /Users/kapi/mentor_empreendedor/web && npx tsc --noEmit && npm run build 2>&1 | tail -20`
Expected: typecheck exit 0. Build completa com "✓ Compiled successfully" e lista de rotas incluindo `/api/transcribe`.

- [ ] **Step 6.3: Commit**

```bash
cd /Users/kapi/mentor_empreendedor
git add web/src/components/chat/chat-input.tsx
git commit -m "$(cat <<'EOF'
feat(audio): integra MicButton no chat-input

MicButton aparece entre textarea e send quando
NEXT_PUBLIC_VOICE_ENABLED=true. Callback onTranscribed anexa o texto
ao fim do value atual (nao sobrescreve), foca textarea, posiciona
cursor ao final e re-roda auto-resize.

Feature flag implicita: se NEXT_PUBLIC_VOICE_ENABLED nao for "true"
no build, MicButton nao renderiza e fluxo texto-only segue identico.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Smoke test local + deploy em produção

**Files:** (nenhum além do `.env.local` do usuário)

Esta tarefa requer duas coisas manuais do usuário:
1. Criar conta em [console.groq.com](https://console.groq.com) e gerar `GROQ_API_KEY`
2. Adicionar `GROQ_API_KEY` + `NEXT_PUBLIC_VOICE_ENABLED=true` nos envs Vercel (Production + Preview) — ou me pedir pra fazer via `vercel env add` se tiver preferência

⚠️ **Armadilha conhecida:** deploy sempre `cd web && vercel --prod --yes` — nunca da raiz, senão cria projeto Vercel duplicado acidental.

- [ ] **Step 7.1: Configurar env vars no ambiente local**

Editar `/Users/kapi/mentor_empreendedor/web/.env.local` (arquivo já existe). Adicionar no final:

```
GROQ_API_KEY=gsk_...            # cole a key obtida em console.groq.com
NEXT_PUBLIC_VOICE_ENABLED=true
```

Salvar.

- [ ] **Step 7.2: Smoke test no dev server**

Run em background: `cd /Users/kapi/mentor_empreendedor/web && npm run dev`
Expected: "Ready in Xs" e URL de dev.

Abrir navegador em `http://localhost:3000`, logar, abrir conversa ou criar uma nova. Confirmar:
- Botão de microfone aparece entre o textarea e o botão de send
- Clicar no mic → browser pede permissão → confirmar → botão fica coral pulsando com timer (ex: "0:05")
- Falar "como posso vender mais pelo WhatsApp" por ~8s → clicar no mic de novo → botão vira amarelo com loader → depois de 1-2s, o texto aparece no textarea
- Editar o texto se quiser → clicar em send → resposta normal do Max chega por streaming

Parar o dev server.

- [ ] **Step 7.3: Configurar env vars no Vercel**

Via CLI (opção A):
```bash
cd /Users/kapi/mentor_empreendedor/web
vercel env add GROQ_API_KEY production
# cole a key quando solicitado
vercel env add GROQ_API_KEY preview
# cole a mesma key
vercel env add NEXT_PUBLIC_VOICE_ENABLED production
# digite: true
vercel env add NEXT_PUBLIC_VOICE_ENABLED preview
# digite: true
```

Ou via dashboard Vercel (opção B): Project → Settings → Environment Variables → Add.

Verificar com: `vercel env ls` — deve listar `GROQ_API_KEY` e `NEXT_PUBLIC_VOICE_ENABLED` com scope Production + Preview.

- [ ] **Step 7.4: Deploy em produção**

Run: `cd /Users/kapi/mentor_empreendedor/web && vercel --prod --yes 2>&1 | tail -10`
Expected: URL de produção + alias `https://maximpulso.com.br` + status `READY`.

- [ ] **Step 7.5: Smoke test em produção**

Abrir `https://maximpulso.com.br` no celular (ideal para testar permissão mobile). Logar, abrir conversa, testar o mesmo fluxo do Step 7.2. Pode testar 3 áudios:
1. Curto (~5s) — "como vender mais pela Internet?"
2. Médio (~30s) — descrição de um problema com cliente
3. Longo (próximo do cap de 2min) — caso completo

Verificar nos logs do Vercel (`vercel logs [production-url]`) os eventos `transcribe` com `charCount`, `audioBytes`, `groqLatencyMs`.

---

## Self-Review (feito durante a escrita)

**1. Spec coverage:**

| Requisito do spec | Task |
|---|---|
| Dependência `groq-sdk` | Task 1 |
| Env var `GROQ_API_KEY` + `NEXT_PUBLIC_VOICE_ENABLED` | Task 1 |
| `lib/groq.ts` wrapper com lazy init | Task 2 |
| `/api/transcribe` com auth + multipart + 10MB max + 1KB min + Groq Whisper Turbo + pt + temperature 0 | Task 3 |
| Logs estruturados sem texto transcrito | Task 3 |
| Erros mapeados 401/400/413/429/502/503 | Task 3 |
| `useVoiceRecorder` hook com RecorderState + timer + cap + MIME fallback | Task 4 |
| `MicButton` 3 estados (idle/recording/transcribing) + timer + toasts via sonner | Task 5 |
| Concatenação ao invés de overwrite em textarea com rascunho | Task 6 (handleTranscribed) |
| Feature flag esconde botão se desabilitado | Task 6 (`VOICE_ENABLED` const) |
| Smoke test + deploy em prod | Task 7 |

Todos os requisitos cobertos.

**2. Placeholder scan:** nenhum TBD/TODO/"implement later"/"similar to". Todos os blocos de código contêm o código completo.

**3. Type consistency:**
- `RecorderState` usado no hook (Task 4) = 'idle' | 'requesting' | 'recording' | 'stopping'. No MicButton (Task 5), `recorder.state` é comparado exatamente com 'recording' e 'idle' — compatível.
- `MicButtonProps.onTranscribed: (text: string) => void` (Task 5) bate exato com `handleTranscribed: (text: string) => void` em chat-input (Task 6).
- Endpoint retorna `{ text: string }` (Task 3) e o client consome `data.text` (Task 5). Consistente.
- MIME candidates lista inclui `''` (default) para fallback, e `pickSupportedMimeType()` trata esse caso retornando string vazia que faz `new MediaRecorder(stream)` sem opções — compatível com a assinatura do constructor.
- `elapsedMs: number` no hook e `recorder.elapsedMs` no MicButton — consistente.

Nenhuma inconsistência detectada.

**4. Gaps conhecidos e risk mitigations:**
- Sem test suite automatizado (projeto não tem). Mitigado por: typecheck rígido + build + 3 smoke tests (dev local, prod mobile, prod desktop).
- Groq rate limit não tem retry automático — se acontecer, user vê toast e tenta de novo. Aceitável na v1.
- Safari iOS <18 fallback pra MP4 — não tenho acesso a iOS <18 pra testar; se falhar, o MicButton simplesmente não renderiza via feature detect. Aceitável.
