'use client'

import { Plus, MessageSquare } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ConversationItem } from './conversation-item'
import type { Conversation } from '@/types/database'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onNew: () => void
  onDelete: (id: string) => void
  onNavigate?: () => void
  loading: boolean
}

export function ConversationList({
  conversations,
  activeId,
  onNew,
  onDelete,
  onNavigate,
  loading,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <Button
          onClick={onNew}
          className="w-full justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 font-heading text-sm font-semibold text-white hover:from-emerald-600 hover:to-emerald-800"
          size="lg"
        >
          <Plus className="size-4" />
          Nova conversa
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3 pb-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <MessageSquare className="size-8 opacity-40" />
            <p>Nenhuma conversa ainda</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onDelete={onDelete}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
