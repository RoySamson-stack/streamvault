const BANDWIDTH_TEST_URL = 'https://raw.githubusercontent.com/hexhoxhex/mkurugenzi_viewer/main/data/channels.json'
const RANGE_SIZE = 200_000

export type ProviderTestResult = {
  index: number
  name: string
  reachable: boolean
  latency: number | null
  bandwidth: number | null
  score: number
}

const healthWindows = new Map<string, { successes: number[]; failures: number[] }>()

function trimWindow(provider: string) {
  const now = Date.now()
  const w = healthWindows.get(provider)
  if (!w) return
  const cutoff = now - 300_000
  w.successes = w.successes.filter(t => t > cutoff)
  w.failures = w.failures.filter(t => t > cutoff)
}

export function recordSuccess(provider: string) {
  if (!healthWindows.has(provider)) healthWindows.set(provider, { successes: [], failures: [] })
  const w = healthWindows.get(provider)!
  trimWindow(provider)
  w.successes.push(Date.now())
}

export function recordFailure(provider: string) {
  if (!healthWindows.has(provider)) healthWindows.set(provider, { successes: [], failures: [] })
  const w = healthWindows.get(provider)!
  trimWindow(provider)
  w.failures.push(Date.now())
}

export function isProviderDown(provider: string): boolean {
  const w = healthWindows.get(provider)
  if (!w) return false
  const total = w.successes.length + w.failures.length
  if (total < 3) return false
  return w.failures.length / total >= 0.75 || w.failures.length >= 4
}

export async function measureBandwidth(): Promise<{ mbps: number; verdict: string }> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const start = performance.now()
    const res = await fetch(BANDWIDTH_TEST_URL, {
      signal: controller.signal,
      cache: 'no-cache',
    })
    clearTimeout(timeout)
    if (!res.ok) return { mbps: 0, verdict: 'error' }
    const reader = res.body?.getReader()
    if (!reader) return { mbps: 0, verdict: 'error' }
    let total = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.length
    }
    const elapsed = (performance.now() - start) / 1000
    const mbps = elapsed > 0 ? (total * 8) / 1_000_000 / elapsed : 0
    const verdict = mbps >= 20 ? 'excellent' : mbps >= 8 ? 'good' : mbps >= 4 ? 'fair' : 'poor'
    return { mbps, verdict }
  } catch {
    return { mbps: 0, verdict: 'error' }
  }
}

export async function testProviderConnectivity(provider: { name: string; testUrl: string }, index: number): Promise<ProviderTestResult> {
  const down = isProviderDown(provider.name)
  try {
    const start = performance.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)
    await fetch(provider.testUrl, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
    clearTimeout(timeout)
    const latency = Math.round(performance.now() - start)
    recordSuccess(provider.name)
    return {
      index,
      name: provider.name,
      reachable: true,
      latency,
      bandwidth: null,
      score: down ? latency + 500 : latency,
    }
  } catch {
    recordFailure(provider.name)
    return {
      index,
      name: provider.name,
      reachable: false,
      latency: null,
      bandwidth: null,
      score: 9999,
    }
  }
}

export type { ProviderTestResult as ProviderTest }
