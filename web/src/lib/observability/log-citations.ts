import { createClient } from '@supabase/supabase-js'
import type { User } from '@/types/database'
import { detectCitations } from './detect-citations'

type LogCitationsArgs = {
  messageId: string
  conversationId: string
  userId: string
  profileSnapshot: Pick<
    User,
    'setor' | 'estagio' | 'faturamento_mensal'
  > | null
  assistantText: string
}

/**
 * Detecta gurus/livros citados no texto do assistant e grava uma linha por
 * citation em public.prompt_citations, com snapshot do perfil do usuário
 * no momento — permite analytics de "o que o Max cita para QUEM".
 *
 * Usa service-role client para contornar RLS. Seguro em rota de API.
 * Fire-and-forget: erros são logados mas não propagados.
 */
export async function logCitations({
  messageId,
  conversationId,
  userId,
  profileSnapshot,
  assistantText,
}: LogCitationsArgs): Promise<void> {
  const citations = detectCitations(assistantText)
  if (citations.length === 0) return

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('[citations] service-role env ausente, skip')
    return
  }

  const admin = createClient(url, key)
  const rows = citations.map((c) => ({
    message_id: messageId,
    conversation_id: conversationId,
    user_id: userId,
    user_setor: profileSnapshot?.setor ?? null,
    user_estagio: profileSnapshot?.estagio ?? null,
    user_faturamento_mensal: profileSnapshot?.faturamento_mensal ?? null,
    citation_type: c.type,
    citation_key: c.key,
    citation_name: c.name,
    citation_count: c.count,
  }))

  const { error } = await admin.from('prompt_citations').insert(rows)
  if (error) {
    console.error('[citations] insert failed:', error.message)
  }
}
