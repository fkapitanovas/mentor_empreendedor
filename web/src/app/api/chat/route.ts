import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/prompts'
import {
  extractProfile,
  extractProfileUpdate,
  cleanResponse,
  standardizeProfileFields,
} from '@/lib/profile-extractor'
import { generateConversationSummary } from '@/lib/summary'
import type { User, Message } from '@/types/database'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Validate auth
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return new Response(JSON.stringify({ error: 'Nao autorizado' }), {
        status: 401,
      })
    }

    // 2. Parse body
    const body = await request.json()
    const { conversationId, message } = body as {
      conversationId?: string
      message?: string
    }

    if (!conversationId || !message) {
      return new Response(
        JSON.stringify({ error: 'conversationId e message sao obrigatorios' }),
        { status: 400 }
      )
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, title')
      .eq('id', conversationId)
      .eq('user_id', authUser.id)
      .single()

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversa nao encontrada' }),
        { status: 404 }
      )
    }

    // 3. Load user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    const userProfile = profile as User | null

    // 4. Load conversation history (last 100 messages)
    const { data: historyRows } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100)

    const history: { role: 'user' | 'assistant'; content: string }[] = (
      historyRows || []
    ).map((m: Pick<Message, 'role' | 'content'>) => ({
      role: m.role,
      content: m.content,
    }))

    // 5. Load conversation summary
    const { data: summaryRow } = await supabase
      .from('conversation_summaries')
      .select('summary')
      .eq('conversation_id', conversationId)
      .single()

    const summaryText = summaryRow?.summary as string | null

    // 6. Build system prompt
    const systemPrompt = buildSystemPrompt(userProfile, summaryText)

    // 7. Save user message immediately
    await supabase.from('messages').insert({
      user_id: authUser.id,
      conversation_id: conversationId,
      role: 'user',
      content: message,
    })

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    // 8. Build messages array for Claude
    const claudeMessages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ]

    // 9. Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        let fullText = ''

        try {
          const messageStream = anthropic.messages.stream({
            model: 'claude-sonnet-4-6',
            max_tokens: 2048,
            system: [
              {
                type: 'text' as const,
                text: systemPrompt,
                cache_control: { type: 'ephemeral' as const },
              },
            ],
            messages: claudeMessages,
          })

          for await (const event of messageStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const text = event.delta.text
              fullText += text
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              )
            }
          }

          // After stream ends: post-processing
          const cleanedText = cleanResponse(fullText)

          // Extract profile data (initial diagnostic or update)
          const profileData =
            extractProfile(fullText) || extractProfileUpdate(fullText)
          let profileUpdated = false

          // Save assistant message (cleaned)
          await supabase.from('messages').insert({
            user_id: authUser.id,
            conversation_id: conversationId,
            role: 'assistant',
            content: cleanedText,
          })

          // Update user profile if extracted
          if (profileData) {
            const standardized = standardizeProfileFields(profileData)
            // If this is initial profile extraction, mark as onboarded
            if (extractProfile(fullText)) {
              standardized.is_onboarded = true
            }
            const { error: updateError } = await supabase
              .from('users')
              .update(standardized)
              .eq('id', authUser.id)

            if (!updateError) {
              profileUpdated = true
            }
          }

          // Count messages in conversation for summary trigger
          const { count: messageCount } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)

          // Fire-and-forget: summary generation every 20 messages
          if (messageCount && messageCount % 20 === 0) {
            // Load all messages for summary
            supabase
              .from('messages')
              .select('role, content')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: true })
              .then(({ data: allMessages }) => {
                if (!allMessages) return
                const msgs = allMessages.map(
                  (m: Pick<Message, 'role' | 'content'>) => ({
                    role: m.role,
                    content: m.content,
                  })
                )
                generateConversationSummary(summaryText, msgs).then(
                  (newSummary) => {
                    if (!newSummary) return
                    supabase
                      .from('conversation_summaries')
                      .upsert(
                        {
                          conversation_id: conversationId,
                          summary: newSummary,
                          messages_covered: messageCount,
                          updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'conversation_id' }
                      )
                      .then(() => {})
                  }
                )
              })
          }

          // Fire-and-forget: title generation for first message
          if (
            messageCount &&
            messageCount <= 2 &&
            conversation.title === 'Nova conversa'
          ) {
            anthropic.messages
              .create({
                model: 'claude-haiku-4-5',
                max_tokens: 50,
                messages: [
                  {
                    role: 'user',
                    content: `Generate a short title (3-5 words, in Portuguese) for a conversation that starts with this message. Return ONLY the title, nothing else.\n\nMessage: ${message}`,
                  },
                ],
              })
              .then((titleResponse) => {
                const block = titleResponse.content[0]
                if (block.type === 'text') {
                  const title = block.text.trim().replace(/^["']|["']$/g, '')
                  supabase
                    .from('conversations')
                    .update({ title })
                    .eq('id', conversationId)
                    .then(() => {})
                }
              })
              .catch(() => {})
          }

          // Send done signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, profileUpdated })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          console.error('Erro no streaming do chat:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: 'Erro ao processar mensagem' })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Erro na API de chat:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500 }
    )
  }
}
