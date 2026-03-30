import { NextResponse } from 'next/server'
import { proxyOpenF1 } from '../_helpers'

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams
    return await proxyOpenF1('race_control', params)
  } catch (error) {
    console.error('OpenF1 race control error:', error)
    return NextResponse.json({ error: 'Failed to fetch race control updates' }, { status: 500 })
  }
}
