import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Esqueci minha senha',
  description: 'Recupere o acesso à sua conta Max Impulso.',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
