import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const now = new Date()
  return [
    // Main pages — highest priority
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/browse`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/search`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/sports`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/f1`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },

    // Auth pages — lower priority, less frequent changes
    { url: `${base}/auth/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/auth/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/auth/forgot`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
    { url: `${base}/auth/reset`, lastModified: now, changeFrequency: 'monthly', priority: 0.2 },
  ]
}
