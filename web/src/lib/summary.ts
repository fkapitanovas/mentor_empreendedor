import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

/**
 * Generates a structured conversation summary via Claude API.
 *
 * Receives previous summary (if any) + recent messages.
 * Returns summary of up to 800 words with 5 sections.
 * Ported from Python: app/services/mentor.py — generate_conversation_summary()
 */
export async function generateConversationSummary(
  previousSummary: string | null,
  messages: { role: string; content: string }[]
): Promise<string | null> {
  const system = `Voce e um assistente que gera resumos estruturados de conversas entre \
um mentor de empreendedorismo e um microempreendedor brasileiro.

Gere um resumo com EXATAMENTE estas 5 secoes (maximo 800 palavras total):

1. TOPICOS DISCUTIDOS: Principais temas abordados nas conversas.
2. DECISOES TOMADAS: Decisoes que o empreendedor tomou ou comunicou.
3. CONSELHOS DADOS: Principais orientacoes e recomendacoes feitas pelo mentor.
4. PROGRESSO DO EMPREENDEDOR: Evolucao observada, metas alcancadas, mudancas.
5. PENDENCIAS E PROXIMOS PASSOS: Tarefas mencionadas mas nao concluidas, compromissos.

Seja objetivo e factual. Foque no que e util para dar continuidade ao acompanhamento.`

  const contentParts: string[] = []
  if (previousSummary) {
    contentParts.push(
      `RESUMO ANTERIOR (comprime conversas mais antigas):\n${previousSummary}\n\n---\n\n`
    )
  }
  contentParts.push('MENSAGENS RECENTES:\n')
  for (const m of messages) {
    const roleLabel = m.role === 'user' ? 'Empreendedor' : 'Mentor'
    contentParts.push(`${roleLabel}: ${m.content}\n`)
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system,
      messages: [{ role: 'user', content: contentParts.join('') }],
    })
    const block = response.content[0]
    if (block.type === 'text') {
      return block.text
    }
    return null
  } catch (error) {
    console.error('Erro ao gerar resumo de conversa:', error)
    return null
  }
}
