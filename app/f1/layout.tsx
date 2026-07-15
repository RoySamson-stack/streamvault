import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'F1 Live Streams & Race Replays',
  description: 'Watch Formula 1 live streams, race replays, team radio, and race control updates on VaultSphere. Follow the 2026 F1 season with session schedules and on-demand replay links.',
  openGraph: {
    title: 'F1 Live Streams & Race Replays · VaultSphere',
    description: 'Watch Formula 1 live streams, race replays, team radio, and race control updates. Follow the 2026 F1 season.',
  },
  alternates: {
    canonical: '/f1',
  },
}

export default function F1Layout({ children }: { children: React.ReactNode }) {
  return children
}
