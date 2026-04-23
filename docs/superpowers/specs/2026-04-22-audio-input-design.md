# Design — Input de áudio via Groq Whisper

**Data:** 2026-04-22
**Autor:** fkapitanovas (via Claude)
**Status:** Aprovado para implementação

## Contexto

Empreendedor MEI brasileiro, público-alvo do Max Impulso, geralmente acessa a plataforma em mobile, em ambientes barulhentos (feira, balcão, carro) e em correria. Digitar pergunta completa num textarea é fricção desnecessária. A forma natural de comunicação desse público é áudio pelo WhatsApp. Adicionar input de áudio no chat reduz a barreira de entrada e expande significativamente os cenários de uso (ex: prestador durante um atendimento, confeiteira com as mãos ocupadas).

## Objetivo

Permitir que o empreendedor grave um áudio de até 2 minutos diretamente no chat, tenha ele transcrito automaticamente para português brasileiro via Groq Whisper Turbo, com opção de revisar/editar o texto transcrito antes de enviar como mensagem.

## Decisão-chave: tap-to-toggle com preview editável

Rejeitado: push-to-hold (WhatsApp clássico) — acessibilidade pior, UX estranha no desktop, e o erro de transcrição vai direto pro chat sem o usuário notar.

Escolhido: tap-to-toggle + texto transcrito entra no textarea pra revisão antes do envio. Trade-off: um clique a mais que o WhatsApp clássico. Valor: empreendedor vê "da pra faze norcamento" antes de mandar e corrige, evitando frustração silenciosa no chat downstream.

## Escopo e YAGNI

**Dentro do escopo:**
- Gravação no browser com `MediaRecorder` (WebM Opus + fallback MP4)
- Transcrição server-side via Groq `whisper-large-v3-turbo` (modelo PT-BR excelente, custo ~$0.0007/min)
- UI com 3 estados (idle/recording/transcribing), timer durante gravação, toasts pra erros
- Cap de 2 minutos com auto-stop
- Sem storage de áudio (Blob vive só em memória, vai pro Groq e some)
- Observabilidade mínima via console.log estruturado (Vercel captura)

**Fora do escopo (YAGNI explícito):**
- Playback do áudio antes de transcrever
- Visualização de waveform durante gravação
- Transcrição incremental em tempo real (streaming) — batch é mais simples e Groq Turbo é rápido o suficiente
- Diarização ou speaker-label
- Storage do áudio no Supabase (privacy first)
- Voice-to-voice (Claude responder em áudio via TTS) — feature separada se demandada no futuro
- Feature flag para fallback entre Groq / Web Speech API — só Groq, sem ramificação

## Arquitetura

Fluxo em 5 etapas no client + server:

```
[1] User toca mic          [2] MediaRecorder grava         [3] User toca mic
    (client)                   WebM/Opus na memória            de novo
     ↓                          ↓                               ↓
     getUserMedia         Chunks em array                 Para gravação, envia
     permissão            Timer UI + cap 2min              Blob → POST /api/transcribe
                                                                  ↓
[5] Texto preenche       [4] Textarea ganha               Backend:
    textarea (append      foco + cursor ao final           - Valida sessão Supabase
    se ja tinha                                            - Valida tamanho <10MB
    rascunho)                                              - groq.audio.transcriptions.create()
                                                           - Log estruturado (sem PII do texto)
                                                           - Retorna { text }
```

Separação de responsabilidades — 3 unidades bem definidas:

- **`useVoiceRecorder` (hook)**: encapsula MediaRecorder, gerencia estado, timer, cap, erros. Expõe `{ state, startRecording, stopRecording, error }`. Consumidores não precisam saber nada sobre WebM ou MediaRecorder.
- **`MicButton` (componente)**: botão de UI com 3 estados visuais. Recebe callback `onTranscribed(text)` e cuida do loop start/stop/fetch/return. Não sabe nada sobre o textarea ou outros inputs.
- **`/api/transcribe` (endpoint)**: recebe multipart, valida auth, chama Groq, retorna `{ text }`. Não sabe nada sobre UI ou contexto da conversa. Métricas (duração do áudio, latência, char count) ficam em logs estruturados, não na resposta.

## Componentes

### 1. `web/src/hooks/use-voice-recorder.ts` (NOVO)

Hook que encapsula a complexidade do `MediaRecorder` API.

**Interface pública:**
```typescript
type RecorderState = 'idle' | 'requesting' | 'recording' | 'stopping'

interface UseVoiceRecorder {
  state: RecorderState
  elapsedMs: number  // tempo em ms da gravação atual (0 quando idle)
  error: string | null
  startRecording: () => Promise<void>  // pede permissão, inicia MediaRecorder
  stopRecording: () => Promise<Blob | null>  // para, retorna Blob ou null se <1s
  cancelRecording: () => void  // aborta sem retornar blob
}

const MAX_DURATION_MS = 120_000
const MIN_DURATION_MS = 1_000
```

**Responsabilidades internas:**
- Resolução de MIME type (tenta `audio/webm;codecs=opus` → `audio/webm` → `audio/mp4`)
- Abre stream com `getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })`
- Tick a cada 100ms pro timer UI
- Auto-stop quando `elapsedMs >= MAX_DURATION_MS`
- Cleanup no unmount: fecha stream, aborta recording, limpa timer

### 2. `web/src/components/chat/mic-button.tsx` (NOVO)

Botão de microfone com 3 estados visuais bem diferenciados.

**Props:**
```typescript
interface MicButtonProps {
  onTranscribed: (text: string) => void  // chamado com texto final
  disabled?: boolean  // true durante streaming do chat
}
```

**Estados visuais (Tropical Maximalista):**

| Estado | Ícone | Fundo | Comportamento |
|---|---|---|---|
| `idle` | `Mic` lucide, size-5 | `bg-popover` border-ink 2px | Clique → chama `startRecording` do hook |
| `recording` | `Square` size-5 + timer MM:SS ao lado | `bg-[var(--coral)]` + `animate-pulse` leve | Clique → chama `stopRecording`, se blob válido envia fetch |
| `transcribing` | `Loader2` spinning | `bg-[var(--sun)]` | Desabilitado (user aguarda fetch) |

**Hard shadow consistente com o botão send** (`4px 4px 0 ink` no hover).

**Timer:** mostrar "0:12" ao lado do botão em desktop; em mobile (`<sm` ou pointer coarse), absolute-position acima para não empurrar layout.

**Feedback sonoro/tátil (opcional, se der):** `navigator.vibrate(20)` no start/stop em mobile — mas dentro de try/catch, não bloqueia.

**Accessibility:**
- `aria-label` dinâmico: "Gravar áudio" / "Parar gravação (0:12 gravados)" / "Transcrevendo..."
- `aria-live="polite"` num span interno pro screen reader ouvir mudanças de estado
- Foco visível mantendo padrão do projeto

### 3. `web/src/components/chat/chat-input.tsx` (MODIFICAR)

Mudanças cirúrgicas:

**Layout atualizado:**
```
[textarea flex-1] [MicButton size-12] [SendButton size-12]
```

Adicionar entre o `<textarea>` e o `<Button>` de send. Mesmo `gap-2` já existente.

**Novo handler:**
```typescript
const handleTranscribed = useCallback((text: string) => {
  setValue((prev) => {
    if (!prev.trim()) return text
    // Já tem texto digitado — anexa no final com espaço
    return `${prev.trim()} ${text}`
  })
  // Foco no textarea e cursor ao final para edição
  setTimeout(() => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
    // Re-run auto-resize
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, 0)
}, [])
```

**Regra de disable:** `<MicButton disabled={isStreaming} />` — mesma regra do botão send (mic não grava durante streaming do assistant).

### 4. `web/src/app/api/transcribe/route.ts` (NOVO)

Endpoint POST para receber áudio e retornar texto.

**Runtime:** `'nodejs'` (não edge — `groq-sdk` precisa Node APIs, e arquivos multipart em edge são mais restritos).

**Fluxo do handler:**
```typescript
export const runtime = 'nodejs'

export async function POST(request: Request) {
  // 1. Valida sessão via Supabase SSR
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return json({ error: 'unauthorized' }, 401)

  // 2. Parse multipart
  const formData = await request.formData()
  const audio = formData.get('audio') as Blob | null
  if (!audio) return json({ error: 'no_audio' }, 400)

  // 3. Valida tamanho
  if (audio.size > 10 * 1024 * 1024) {
    return json({ error: 'audio_too_large' }, 413)
  }
  if (audio.size < 1000) {
    return json({ error: 'audio_too_short' }, 400)
  }

  // 4. Chama Groq
  const groq = getGroqClient()
  const t0 = Date.now()
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: 'whisper-large-v3-turbo',
      language: 'pt',
      temperature: 0,
      response_format: 'json',
    })
    const latencyMs = Date.now() - t0

    // 5. Log estruturado (sem logar o texto por privacy)
    console.log(JSON.stringify({
      event: 'transcribe',
      userId: user.id,
      audioBytes: audio.size,
      charCount: transcription.text.length,
      groqLatencyMs: latencyMs,
      success: true,
    }))

    return json({ text: transcription.text }, 200)
  } catch (err) {
    console.error(JSON.stringify({
      event: 'transcribe',
      userId: user.id,
      audioBytes: audio.size,
      error: err instanceof Error ? err.message : String(err),
      success: false,
    }))
    // Mapeia erros Groq pra códigos HTTP
    if (err instanceof Error && err.message.includes('429')) {
      return json({ error: 'rate_limited' }, 429)
    }
    return json({ error: 'transcription_failed' }, 502)
  }
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
```

### 5. `web/src/lib/groq.ts` (NOVO)

Wrapper minimalista do SDK Groq com lazy init.

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

`isGroqConfigured()` será usada na rota `(chat)/layout.tsx` para expor uma variável `voiceEnabled` via `window.__MAX_IMPULSO__` ou por prop de server component → client component. Se a key não tá setada, `MicButton` nem renderiza.

### 6. `web/package.json` (MODIFICAR)

Adicionar `groq-sdk` (última versão estável) como dependency.

### 7. `web/.env.example` (MODIFICAR)

Documentar nova variável:
```
# Groq API key para transcricao de audio via Whisper Turbo
# https://console.groq.com
GROQ_API_KEY=gsk_...
```

## UX — 3 estados visuais do botão + feedback

Todos seguindo o sistema de design Tropical Maximalista (border-ink 2px, hard shadow `4px 4px 0 ink` no hover, rounded-full, size-12 para manter paridade com send button).

**Estado `idle`:** `bg-popover` (cream), ícone `Mic` preto. Clique pede permissão de microfone na primeira vez, inicia gravação.

**Estado `recording`:** `bg-[var(--coral)]` com `animate-pulse` suave, ícone `Square` em `text-[var(--cream)]`, timer MM:SS visível (desktop: ao lado do botão; mobile: absolute acima do botão). Clique para a gravação e inicia transcrição.

**Estado `transcribing`:** `bg-[var(--sun)]`, ícone `Loader2` spinning, `text-on-bright`. Botão desabilitado. Ao completar o fetch, volta pra idle e o texto vai pro textarea.

**Toasts (via o sistema de toast já existente no projeto — `sonner` ou equivalente; se não tiver, criar componente simples):**
- Permissão negada: "Para usar o microfone, libere o acesso nas configurações do navegador."
- Áudio muito curto (<1s): "Gravação muito curta — tenta falar por mais tempo."
- Erro de transcrição: "Não consegui transcrever seu áudio. Tenta digitar ou tenta de novo."
- Rate limit: "Muitas gravações seguidas. Aguarda uns segundos."
- Audio muito longo (backend retornou 413): "Áudio muito longo. Tenta quebrar em pedaços menores."

**Observação sobre toast:** verificar se o projeto já usa alguma biblioteca de toast. Se não, usar um componente simples baseado em estado no layout do chat. Implementação fica no plano.

## Fallback / graceful degradation

Ordem de verificação no client, do mais genérico pro mais específico:

1. **Groq não configurado no servidor** → `voiceEnabled: false` passa do server component para o client → `MicButton` não renderiza.
2. **Browser não suporta MediaRecorder ou getUserMedia** → `MicButton` detecta no `useEffect` de mount (`typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia`) e esconde a si mesmo.
3. **User nega permissão de microfone** → `startRecording` captura `NotAllowedError`, seta `error` no hook, `MicButton` mostra toast.
4. **Permissão OK mas áudio não gravou nada (<1s)** → `stopRecording` retorna null, `MicButton` mostra toast e volta pra idle sem fetch.
5. **Fetch /api/transcribe falha (rede)** → catch no client mostra toast "sem conexão".
6. **API Groq retorna erro 5xx** → endpoint retorna 502, client mostra toast "tenta de novo".
7. **Rate limit Groq** → endpoint retorna 429, client mostra toast "aguarda uns segundos".

## Edge cases cobertos

1. User toca mic durante `isStreaming` do chat → botão desabilitado via prop, mesmo tratamento que o botão send.
2. User toca mic, começa a gravar, muda de conversa no sidebar → cleanup do hook via `useEffect` cleanup, stream para, recording reseta.
3. Durante `transcribing`, user tenta tocar mic de novo → botão desabilitado (estado do componente).
4. Transcription retorna texto e user já começou a digitar manualmente → `handleTranscribed` detecta via `value.trim()` e concatena com espaço ao final, não sobrescreve.
5. Textarea tem rascunho, user grava áudio → novo texto anexa no FIM do rascunho, como acima.
6. User transcreve, vê o texto, decide apagar e regravar → tap mic de novo funciona normal (idle → recording).
7. Safari iOS <18 pode não suportar WebM → fallback de MIME type para `audio/mp4`.
8. User fecha a aba durante `recording` → MediaRecorder é garbage collected, stream é fechado automaticamente pelo browser.
9. User minimiza o browser durante `recording` → iOS pode pausar o mic; Android mantém. Timer vai continuar contando no client, auto-stop em 2min ainda dispara. Se houver gap de áudio, Whisper lida bem (ignora silêncio).
10. User está num áudio de 1:50 e aperta stop às 1:51 — auto-stop pode disparar junto. Proteção: `stopRecording` é idempotente (2a chamada é no-op).

## Observabilidade

Server-side, log estruturado em JSON pra Vercel capturar (via `vercel logs` ou dashboard):

```typescript
{
  event: 'transcribe',
  userId: user.id,
  audioBytes: audio.size,
  charCount: transcription.text.length,
  groqLatencyMs: Date.now() - t0,
  success: true | false,
  error?: string  // só em falha
}
```

**NÃO logar o texto transcrito** — é conteúdo do usuário, e não precisamos pra métrica. Se no futuro quisermos samples pra iterar curadoria, opt-in explícito.

**Sem tabela nova no Supabase por ora.** Se virar necessidade (métricas por usuário, rate limiting próprio, etc.), criamos `audio_transcriptions` depois. YAGNI.

## Segurança

1. **Autenticação:** rota `/api/transcribe` exige sessão Supabase válida via `supabase.auth.getUser()`. Anonymous access proibido.
2. **Tamanho máximo:** 10MB no body — equivale a ~10+ min de Opus bem longe do cap de 2min. Serve como proteção contra upload abusivo.
3. **Sem storage:** áudio jamais toca disco/Supabase Storage. Vai da memória Node direto pro Groq SDK.
4. **API key no servidor:** `GROQ_API_KEY` só no backend, nunca exposta no client.
5. **LGPD:** sem persistência → sem consentimento adicional necessário. Se no futuro armazenarmos, precisa opt-in explícito e política de retenção.
6. **Rate limit no nível usuário:** não implementado nesta iteração (Groq já tem rate limit de plataforma). Se virar abuso, adicionamos rate limiting via Upstash Redis depois.

## Custo

Groq Whisper Turbo: ~$0.04/hora = ~$0.0007/minuto.

Cenário estimado com 100 MEIs ativos gravando ~10min/dia cada:
- 100 × 10min = 1000 min/dia = ~$0.70/dia
- ~$21/mês

Cenário dobrado (200 MEIs × 15min/dia):
- 200 × 15min = 3000 min/dia = ~$2.10/dia
- ~$63/mês

Mesmo nos cenários otimistas de crescimento, continua sub-$100/mês. Rodinha.

Comparação: OpenAI Whisper seria ~10× isso ($0.006/min = ~$210/mês no cenário base). Groq é o claro vencedor.

## Impacto no projeto

- **Dependências novas:** `groq-sdk` (~300KB empacotado)
- **Env vars novas:** `GROQ_API_KEY` (local + Vercel prod + Vercel preview)
- **Token budget do prompt:** zero impacto (é backend)
- **Latência do chat principal:** zero impacto (endpoint separado)
- **Código novo:** ~250 linhas (hook + componente + endpoint + wrapper SDK)
- **Código modificado:** ~20 linhas (chat-input.tsx + package.json + .env.example)

## Critérios de sucesso

1. Um empreendedor em mobile abre o chat, toca no mic, fala "como posso vender mais pelo WhatsApp", toca de novo, vê o texto aparecer em <3s, aperta enviar, resposta do Max chega normal.
2. Zero regressão no fluxo atual de digitação (chat input existente continua funcionando idêntico).
3. `npm run build` continua passando.
4. Sem aumento perceptível de latência no chat principal (transcribe é endpoint separado).
5. Nenhum áudio tocando disco ou banco.
6. Logs Vercel mostram eventos `transcribe` com latência, tamanho do áudio e char count — suficiente pra iterar no futuro se precisar.
