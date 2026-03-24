import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search movies, series, and anime by title, cast, or genre.',
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
