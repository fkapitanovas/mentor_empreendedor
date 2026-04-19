import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { type NextRequest } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nao autorizado' }), {
        status: 401,
      })
    }

    // Verify conversation belongs to user
    const { data: conversation, error: fetchError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversa nao encontrada' }),
        { status: 404 }
      )
    }

    const body = await request.json()
    const { firstMessage } = body as { firstMessage?: string }

    if (!firstMessage) {
      return new Response(
        JSON.stringify({ error: 'firstMessage e obrigatorio' }),
        { status: 400 }
      )
    }

    // Generate title via Claude Haiku
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: `Generate a short title (3-5 words, in Portuguese) for a conversation that starts with this message. Return ONLY the title, nothing else.\n\nMessage: ${firstMessage}`,
        },
      ],
    })

    const block = response.content[0]
    if (block.type !== 'text') {
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar titulo' }),
        { status: 500 }
      )
    }

    const title = block.text.trim().replace(/^["']|["']$/g, '')

    const { error: updateError } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', id)

    if (updateError) {
      console.error('Erro ao atualizar titulo:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar titulo' }),
        { status: 500 }
      )
    }

    return Response.json({ title })
  } catch (error) {
    console.error('Erro na API de titulo:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}
