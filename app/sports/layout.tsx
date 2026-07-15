import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Sports — F1, NBA, NFL, EPL & More',
  description: 'Watch live sports on VaultSphere. Stream F1 races, NBA basketball, NFL football, EPL soccer, MLB, NHL, UFC, and more. Today\'s live sports schedule with multi-source streaming.',
  openGraph: {
    title: 'Live Sports — F1, NBA, NFL, EPL & More · VaultSphere',
    description: 'Watch live sports on VaultSphere. Stream F1, NBA, NFL, EPL, MLB, NHL, UFC and more with today\'s full schedule.',
  },
  alternates: {
    canonical: '/sports',
  },
}

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return children
}
