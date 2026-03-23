import { NextResponse } from 'next/server'

const TMDB_KEY = process.env.NEXT_PUBLIC_TMDB_KEY
const TMDB_BASE = process.env.NEXT_PUBLIC_TMDB_BASE || 'https://api.themoviedb.org/3'

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
    const url = `${TMDB_BASE}/${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_KEY}`
    const res = await fetch(url, {
      next: { revalidate: 300 }
    })

    if (!res.ok) {
      return NextResponse.json({ error: `TMDB API error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('TMDB proxy error:', err)
    return NextResponse.json({ error: 'Failed to fetch from TMDB' }, { status: 500 })
  }
}
