'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConversationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function DeleteConversationDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteConversationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-[3px] border-ink rounded-3xl shadow-hard-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading text-xl font-extrabold">
            Excluir conversa?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. A conversa e suas mensagens serão removidas
            permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
            className="bg-destructive text-destructive-foreground border-[2px] border-ink rounded-xl font-heading font-bold hover:shadow-[4px_4px_0_var(--ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
