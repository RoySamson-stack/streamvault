import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Movies & TV Shows by Genre',
  description: 'Browse thousands of movies and TV shows by genre — Action, Comedy, Drama, Horror, Sci-Fi, Animation, and more. Find your next favorite title on VaultSphere.',
  openGraph: {
    title: 'Browse Movies & TV Shows by Genre · VaultSphere',
    description: 'Browse thousands of movies and TV shows by genre — Action, Comedy, Drama, Horror, Sci-Fi, Animation, and more.',
  },
  alternates: {
    canonical: '/browse',
  },
}

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children
}
