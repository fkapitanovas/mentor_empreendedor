import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar',
  description: 'Entre na sua conta do Max Impulso.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
