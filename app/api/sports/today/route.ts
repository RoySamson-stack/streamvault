import { NextResponse } from 'next/server'

const SPORTSDB_KEY = process.env.NEXT_PUBLIC_SPORTSDB_KEY || '123'
const BASE = 'https://www.thesportsdb.com/api/v1/json'

const POPULAR_LEAGUES = [
  // Soccer
  'English Premier League',
  'UEFA Champions League',
  'UEFA Europa League',
  'UEFA Europa Conference League',
  'Spanish La Liga',
  'Italian Serie A',
  'German Bundesliga',
  'French Ligue 1',
  'Major League Soccer',
  'Copa Libertadores',
  'FIFA World Cup',
  // Basketball
  'NBA',
  'EuroLeague',
  'NCAA Division I',
  // American Football
  'NFL',
  'NCAA',
  // Baseball
  'MLB',
  'Nippon Professional Baseball',
  'KBO League',
  // Hockey
  'NHL',
  // Motorsport
  'Formula 1',
  'NASCAR Cup Series',
  'MotoGP',
  // Cricket
  'Indian Premier League',
  'Big Bash League',
  'The Hundred',
  // Tennis
  'ATP World Tour',
  'WTA Tour',
  // Rugby
  'Six Nations Championship',
  'Rugby World Cup',
  // Golf
  'PGA Tour',
  'European Tour',
  // Combat
  'UFC',
  'Boxing',
]

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
const POPULAR_SET = new Set(POPULAR_LEAGUES.map(normalize))

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)

  try {
    const url = `${BASE}/${SPORTSDB_KEY}/eventsday.php?d=${encodeURIComponent(date)}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ events: [], error: `SportsDB error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    const raw = Array.isArray(data?.events) ? data.events : []
    const events = raw.filter((e: any) => {
      const league = normalize(e?.strLeague || '')
      return POPULAR_SET.has(league)
    })

    return NextResponse.json({ date, events })
  } catch (err) {
    console.error('SportsDB proxy error:', err)
    return NextResponse.json({ events: [], error: 'Failed to fetch events' }, { status: 500 })
  }
}
