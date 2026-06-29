import { NextResponse } from 'next/server'

const CHANNELS_URL = 'https://raw.githubusercontent.com/hexhoxhex/mkurugenzi_viewer/main/data/channels.json'

export const revalidate = 300

export async function GET() {
  try {
    const res = await fetch(CHANNELS_URL, { next: { revalidate: 300 } })
    if (!res.ok) {
      return NextResponse.json({ channels: [], error: `Channels fetch error: ${res.status}` }, { status: res.status })
    }
    const data = await res.json()
    return NextResponse.json({ channels: data })
  } catch (err) {
    console.error('Live channels error:', err)
    return NextResponse.json({ channels: [], error: 'Failed to fetch channels' }, { status: 500 })
  }
}
