import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Citações do prompt',
  robots: { index: false, follow: false },
}

export default function CitationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
