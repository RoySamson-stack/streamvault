export type TasteProfile = {
  topGenres: string[]
  prefersSeries: boolean
  medianYear: number | null
}

export function buildProfile(history: { genres: string[]; type: 'movie' | 'tv'; year: number }[]): TasteProfile {
  if (history.length === 0) return { topGenres: [], prefersSeries: false, medianYear: null }

  const genreCounts = new Map<string, number>()
  let seriesCount = 0
  const years: number[] = []

  for (const h of history) {
    h.genres.forEach(g => genreCounts.set(g, (genreCounts.get(g) || 0) + 1))
    if (h.type === 'tv') seriesCount++
    years.push(h.year)
  }

  const topGenres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre)

  years.sort((a, b) => a - b)
  const medianYear = years.length > 0 ? years[Math.floor(years.length / 2)] : null

  return {
    topGenres,
    prefersSeries: seriesCount > history.length / 2,
    medianYear,
  }
}

export function recommend<T extends { id: string; title: string; genre: string[]; type: 'movie' | 'tv'; year: number; rating: number }>(
  pool: T[],
  history: { id: string }[],
  profile: TasteProfile,
  limit = 18,
): T[] {
  if (profile.topGenres.length === 0) return []

  const watched = new Set(history.map(h => h.id))
  const seen = new Set<string>()

  const scored = pool
    .filter(item => !watched.has(item.id) && seen.size < limit * 2)
    .map(item => {
      let score = 0
      for (const g of item.genre) {
        const idx = profile.topGenres.findIndex(tg => tg.toLowerCase() === g.toLowerCase())
        if (idx >= 0) score += (profile.topGenres.length - idx) * 2
      }
      if (profile.medianYear !== null && item.year) {
        const dist = Math.abs(item.year - profile.medianYear)
        score += Math.max(0, 1 - dist / 30) * 3
      }
      if (profile.prefersSeries && item.type === 'tv') score += 2
      if (!profile.prefersSeries && item.type === 'movie') score += 2
      score += item.rating / 10
      return { item, score }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.item)

  return scored
}
