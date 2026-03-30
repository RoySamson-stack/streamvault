import { NextResponse } from 'next/server'

const BASE = 'https://api.openf1.org/v1'
const DEFAULT_YEAR = '2026'

export async function proxyOpenF1(endpoint: string, params: URLSearchParams) {
  if (!params.has('year')) {
    params.set('year', DEFAULT_YEAR)
  }
  const query = params.toString()
  const url = `${BASE}/${endpoint}${query ? `?${query}` : ''}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`OpenF1 error ${res.status}`)
  }
  const data = await res.json()
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}
