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
      // Idempotent: se ja estamos parando, retorna null silenciosamente.
      // Consumer (MicButton) ja guarda contra double-stop via estado proprio.
      return null
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
