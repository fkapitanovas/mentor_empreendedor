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
import { Separator } from '@/components/ui/separator'
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

  // Extract active conversation ID from pathname
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
      // If the deleted conversation was active, navigate away
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
      {/* Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b px-3">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu de conversas</SheetTitle>
              {sidebarContent}
            </SheetContent>
          </Sheet>

          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-700 text-xs font-bold text-white">
            M
          </div>
          <span className="text-sm font-semibold">Max Impulso</span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Menu do usuario" />
              }
            >
              <User className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href="/profile" />}
              >
                <UserCircle className="size-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/settings" />}
              >
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
        {/* Desktop sidebar */}
        <aside className="hidden w-72 shrink-0 border-r md:block">
          {sidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
