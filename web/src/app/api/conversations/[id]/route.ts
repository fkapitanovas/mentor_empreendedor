import { createClient } from '@/lib/supabase/server'
import { type NextRequest } from 'next/server'

export async function DELETE(
  _request: NextRequest,
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

    // Delete conversation (cascade deletes messages + summary via DB)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao deletar conversa:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Erro ao deletar conversa' }),
        { status: 500 }
      )
    }

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Erro na API de conversa:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}
