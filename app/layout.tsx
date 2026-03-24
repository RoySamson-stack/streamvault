// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'VaultSphere — Discover Movies, Series, Sports',
    template: '%s · VaultSphere',
  },
  description: 'Discover movies, series, anime, and live sports schedules in one place.',
  keywords: [
    'movies',
    'tv shows',
    'series',
    'anime',
    'sports schedule',
    'entertainment discovery',
    'watch guide',
  ],
  openGraph: {
    title: 'VaultSphere — Discover Movies, Series, Sports',
    description: 'Explore trending movies, popular series, anime, and today’s sports.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VaultSphere — Discover Movies, Series, Sports',
    description: 'Explore trending movies, popular series, anime, and today’s sports.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://vaultsphere.vercel.app'
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VaultSphere',
    url: base,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7017853282567866"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
