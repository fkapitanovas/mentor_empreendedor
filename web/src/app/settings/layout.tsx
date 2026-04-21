import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações',
  description: 'Gerencie tema, senha e conta.',
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
