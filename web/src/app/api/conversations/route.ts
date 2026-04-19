import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
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

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Erro ao listar conversas:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao listar conversas' }),
        { status: 500 }
      )
    }

    return Response.json(conversations)
  } catch (error) {
    console.error('Erro na API de conversas:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
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

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'Nova conversa',
      })
      .select('id, title, created_at')
      .single()

    if (error) {
      console.error('Erro ao criar conversa:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar conversa' }),
        { status: 500 }
      )
    }

    return Response.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Erro na API de conversas:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}
