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
