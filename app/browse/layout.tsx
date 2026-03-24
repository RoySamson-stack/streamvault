import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse',
  description: 'Browse popular movies and TV shows by genre.',
}

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children
}
