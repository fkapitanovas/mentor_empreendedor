import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Criar conta',
  description: 'Crie sua conta e comece a conversar com o Max Impulso.',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
