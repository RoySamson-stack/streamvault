// app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import ServiceWorkerRegistrar from './components/ServiceWorkerRegistrar'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'VaultSphere — Watch Movies, TV Series, Anime & Live Sports Free',
    template: '%s · VaultSphere',
  },
  description: 'VaultSphere is your ultimate entertainment hub. Discover trending movies, popular TV series, anime, and live sports schedules in one place. Start watching free streaming content instantly.',
  keywords: [
    'free movies online',
    'watch tv series online',
    'streaming platform',
    'anime streaming',
    'live sports schedule',
    'F1 streaming',
    'entertainment discovery',
    'free movie streaming',
    'watch free series',
    'VaultSphere',
    'online streaming',
    'TV shows',
    'anime online',
    'sports streaming',
  ],
  authors: [{ name: 'VaultSphere' }],
  creator: 'VaultSphere',
  publisher: 'VaultSphere',
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'VaultSphere — Watch Movies, TV Series, Anime & Live Sports Free',
    description: 'Explore trending movies, popular series, anime, and today\'s live sports on VaultSphere. Your free streaming discovery hub.',
    type: 'website',
    locale: 'en_US',
    siteName: 'VaultSphere',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VaultSphere — Watch Movies, TV Series, Anime & Live Sports Free',
    description: 'Explore trending movies, popular series, anime, and today\'s live sports on VaultSphere.',
  },
  alternates: {
    canonical: '/',
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
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}
