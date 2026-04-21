import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meu perfil',
  description: 'Veja e edite os dados do seu negócio.',
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children
}
