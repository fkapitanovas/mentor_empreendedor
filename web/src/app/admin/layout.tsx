import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Painel admin',
  description: 'Gestão de usuários do Max Impulso.',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
