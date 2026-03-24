import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sports',
  description: 'See today’s popular sports events across major leagues.',
}

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return children
}
