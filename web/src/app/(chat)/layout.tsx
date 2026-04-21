'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, LogOut, User, Settings, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/theme-toggle'
import { ConversationList } from '@/components/sidebar/conversation-list'
import { useConversations } from '@/hooks/use-conversations'
import { createClient } from '@/lib/supabase/client'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { conversations, loading, loadConversations, createConversation, deleteConversation } =
    useConversations()
  const [sheetOpen, setSheetOpen] = useState(false)

  const activeId = pathname.startsWith('/c/') ? pathname.split('/c/')[1] : null

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleNew = useCallback(async () => {
    const conv = await createConversation()
    setSheetOpen(false)
    router.push(`/c/${conv.id}`)
  }, [createConversation, router])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id)
      if (activeId === id) {
        if (conversations.length > 1) {
          const next = conversations.find((c) => c.id !== id)
          if (next) router.push(`/c/${next.id}`)
          else router.push('/')
        } else {
          router.push('/')
        }
      }
    },
    [deleteConversation, activeId, conversations, router]
  )

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }, [router])

  const sidebarContent = (
    <ConversationList
      conversations={conversations}
      activeId={activeId}
      onNew={handleNew}
      onDelete={handleDelete}
      onNavigate={() => setSheetOpen(false)}
      loading={loading}
    />
  )

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      {/* Header */}
      <header
        role="banner"
        className="flex h-14 shrink-0 items-center justify-between border-b-[2px] border-ink bg-card px-4"
      >
        <div className="flex items-center gap-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="focus-visible:ring-2 focus-visible:ring-primary/40 md:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-0"
              aria-label="Conversas"
            >
              <SheetTitle className="sr-only">Menu de conversas</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 bg-primary text-primary-foreground rounded-full font-heading text-xs font-bold uppercase tracking-widest shadow-hard-sm -rotate-[1.5deg]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sun)] text-ink font-heading font-extrabold text-sm">M</span>
            Max Impulso
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Menu do usuario"
                  className="focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              }
            >
              <User className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href="/profile" />}>
                <UserCircle className="size-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />}>
                <Settings className="size-4" />
                Configuracoes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          role="navigation"
          aria-label="Conversas"
          className="hidden w-72 shrink-0 border-r-[2px] border-ink bg-muted md:block"
        >
          {sidebarContent}
        </aside>
        <main
          id="main-content"
          role="main"
          className="flex flex-1 flex-col overflow-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
