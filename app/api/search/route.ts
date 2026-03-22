import { NextResponse } from 'next/server'

const KEY = process.env.NEXT_PUBLIC_TMDB_KEY
const BASE = process.env.NEXT_PUBLIC_TMDB_BASE || 'https://api.themoviedb.org/3'
const IMG = process.env.NEXT_PUBLIC_TMDB_IMG || 'https://image.tmdb.org/t/p'

const withImg = (path: string | null, size = 'w185') => (path ? `${IMG}/${size}${path}` : null)

export async function GET(request: Request) {
  if (!KEY) {
    return NextResponse.json({ results: [] }, { status: 200 })
  }
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ results: [] })

  const url = `${BASE}/search/multi?language=en-US&page=1&query=${encodeURIComponent(q)}&api_key=${KEY}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    return NextResponse.json({ results: [] }, { status: res.status })
  }

  const data = await res.json()
  const results = (data?.results || [])
    .filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r: any) => ({
      id: r.id,
      title: r.title || r.name || '',
      year: r.release_date ? parseInt(String(r.release_date).split('-')[0]) : (r.first_air_date ? parseInt(String(r.first_air_date).split('-')[0]) : undefined),
      media_type: r.media_type,
      poster: withImg(r.poster_path),
      rating: r.vote_average || 0,
    }))

  return NextResponse.json({ results })
}
