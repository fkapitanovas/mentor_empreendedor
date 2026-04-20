'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/types/database'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onDelete: (id: string) => void
  onNavigate?: () => void
}

export function ConversationItem({
  conversation,
  isActive,
  onDelete,
  onNavigate,
}: ConversationItemProps) {
  return (
    <Link
      href={`/c/${conversation.id}`}
      onClick={onNavigate}
      className={cn(
        'group flex items-center gap-2 rounded-xl px-3 py-3 text-sm transition-all duration-150',
        isActive
          ? 'border-l-3 border-primary bg-background font-medium'
          : 'hover:bg-background'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate">{conversation.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(conversation.updated_at || conversation.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(conversation.id)
        }}
        aria-label="Excluir conversa"
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </Button>
    </Link>
  )
}
