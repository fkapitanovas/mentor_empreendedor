'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Conversation } from '@/types/database'

const DeleteConversationDialog = dynamic(
  () => import('./delete-conversation-dialog'),
  { ssr: false, loading: () => null }
)

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
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div
      role="listitem"
      className={cn(
        'group flex items-center gap-2 rounded-xl pr-1 text-sm transition-all duration-150',
        isActive
          ? 'border-l-[4px] border-[var(--coral)] bg-card font-semibold'
          : 'hover:bg-card'
      )}
    >
      <Link
        href={`/c/${conversation.id}`}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-3"
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
      </Link>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0 opacity-0 transition-opacity focus-visible:ring-2 focus-visible:ring-primary/40 group-hover:opacity-100 max-md:opacity-100"
        aria-label="Excluir conversa"
        onClick={() => setDialogOpen(true)}
      >
        <Trash2 className="size-3.5 text-muted-foreground" />
      </Button>
      {dialogOpen && (
        <DeleteConversationDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onConfirm={() => onDelete(conversation.id)}
        />
      )}
    </div>
  )
}
