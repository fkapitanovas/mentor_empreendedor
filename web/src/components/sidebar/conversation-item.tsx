'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Link
      href={`/c/${conversation.id}`}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      role="listitem"
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
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 opacity-0 transition-opacity focus-visible:ring-2 focus-visible:ring-primary/40 group-hover:opacity-100 max-md:opacity-100"
              aria-label="Excluir conversa"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          }
        >
          <Trash2 className="size-3.5 text-muted-foreground" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A conversa e suas mensagens serão removidas
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(conversation.id)
                setDialogOpen(false)
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Link>
  )
}
