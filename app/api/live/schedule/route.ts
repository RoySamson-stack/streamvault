import { NextResponse } from 'next/server'

const SCHEDULE_URL = 'https://raw.githubusercontent.com/hexhoxhex/mkurugenzi_viewer/main/data/schedule.json'

export const revalidate = 300

export async function GET() {
  try {
    const res = await fetch(SCHEDULE_URL, { next: { revalidate: 300 } })
    if (!res.ok) {
      return NextResponse.json({ events: [], error: `Schedule fetch error: ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json({ events: data })
  } catch (err) {
    console.error('Live schedule error:', err)
    return NextResponse.json({ events: [], error: 'Failed to fetch schedule' }, { status: 500 })
  }
}
