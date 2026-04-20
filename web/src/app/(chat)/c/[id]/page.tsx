'use client'

import { useEffect, use } from 'react'
import { MessageList } from '@/components/chat/message-list'
import { ChatInput } from '@/components/chat/chat-input'
import { useChat } from '@/hooks/use-chat'

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { messages, isStreaming, streamingText, sendMessage, loadMessages } = useChat(id)

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <MessageList
        messages={messages}
        streamingText={streamingText}
        isStreaming={isStreaming}
        onSendSuggestion={sendMessage}
      />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  )
}
