import { NextResponse } from 'next/server'
import { proxyOpenF1 } from '../_helpers'

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    return await proxyOpenF1('team_radio', params)
  } catch (error) {
    console.error('OpenF1 team radio error:', error)
    return NextResponse.json({ error: 'Failed to fetch team radio' }, { status: 500 })
  }
}
