import { NextResponse } from 'next/server'

const SOURCE_URL = 'https://f1net.dpdns.org/replays.txt'

interface ReplayEntry {
  year: string
  grandPrix: string
  session: string
  url: string
}

const parseLine = (line: string): ReplayEntry | null => {
  const parts = line.split('|').map((part) => part.trim())
  if (parts.length < 4) return null
  const [year, grandPrix, session, rawUrl] = parts
  if (!year || !grandPrix || !session || !rawUrl) return null
  return {
    year,
    grandPrix,
    session,
    url: rawUrl,
  }
}

export async function GET() {
  try {
    const res = await fetch(`${SOURCE_URL}?_t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Failed to fetch replays: ${res.status}`)
    }

    const text = await res.text()
    const replays = text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map(parseLine)
      .filter((entry): entry is ReplayEntry => Boolean(entry))

    return NextResponse.json({ replays }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('F1 replay proxy error:', error)
    return NextResponse.json({ replays: [] }, { status: 500 })
  }
}
