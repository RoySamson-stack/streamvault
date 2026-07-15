import { NextResponse } from 'next/server'

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY
const TMDB_BASE = process.env.NEXT_PUBLIC_TMDB_BASE || 'https://api.themoviedb.org/3'
const TIMEOUT_MS = 30_000
const MAX_RETRIES = 2

async function fetchWithRetry(url: string, retries: number = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 300 },
      })
      clearTimeout(timer)
      return res
    } catch (err) {
      clearTimeout(timer)
      const isLast = attempt === retries
      if (isLast) throw err
      // Exponential backoff: 1s, 2s
      await new Promise(r => setTimeout(r, 1_000 * Math.pow(2, attempt)))
    }
  }
  throw new Error('unreachable')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 })
  }

  if (!TMDB_KEY) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 })
  }

  try {
    const params = new URLSearchParams(searchParams)
    params.delete('endpoint')
    const extra = params.toString()
    const joiner = endpoint.includes('?') ? '&' : '?'
    const url = `${TMDB_BASE}/${endpoint}${joiner}${extra ? `${extra}&` : ''}api_key=${TMDB_KEY}`
    const res = await fetchWithRetry(url)

    if (!res.ok) {
      return NextResponse.json({ error: `TMDB API error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (err) {
    const msg = err instanceof Error && err.name === 'AbortError'
      ? 'TMDB request timed out after 30s'
      : 'Failed to fetch from TMDB'
    console.error('TMDB proxy error:', err)
    return NextResponse.json({ error: msg }, { status: 504 })
  }
}
