import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Movies, TV Series & Anime',
  description: 'Search VaultSphere\'s library of movies, TV series, and anime by title, genre, or actor. Find any title and start watching instantly.',
  openGraph: {
    title: 'Search Movies, TV Series & Anime · VaultSphere',
    description: 'Search VaultSphere\'s library of movies, TV series, and anime by title, genre, or actor.',
  },
  alternates: {
    canonical: '/search',
  },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
