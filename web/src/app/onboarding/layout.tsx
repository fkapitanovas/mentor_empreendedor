import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conte sobre seu negócio',
  description: 'Personalize o Max Impulso com informações sobre seu negócio.',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children
}
