import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redefinir senha',
  description: 'Defina uma nova senha para sua conta Max Impulso.',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
