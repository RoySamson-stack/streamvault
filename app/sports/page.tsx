'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type EventItem = {
  idEvent?: string
  strEvent?: string
  strLeague?: string
  strSport?: string
  dateEvent?: string
  strTime?: string
  strStatus?: string
  strHomeTeam?: string
  strAwayTeam?: string
  strThumb?: string
  strVideo?: string
}

const OFFICIAL_EMBEDS: { league: string; title: string; url: string }[] = [
  // Add official iframe-safe streams here (league name match)
]

const getYouTubeId = (url: string) => {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/)
  return m ? m[1] : null
}

export default function SportsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [sportFilter, setSportFilter] = useState<string>('All')
  const router = useRouter()

  const onEnter = (action: () => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  useEffect(() => {
    const date = new Date()
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const q = `${yyyy}-${mm}-${dd}`
    async function fetchToday() {
      try {
        const res = await fetch(`/api/sports/today?date=${q}`)
        const data = await res.json()
        const list = Array.isArray(data?.events) ? data.events : []
        setEvents(list)
        if (list[0]?.idEvent) setActiveId(list[0].idEvent)
      } catch (err) {
        console.error('Failed to load sports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchToday()
  }, [])

  const sports = useMemo(() => {
    const set = new Set(events.map(e => e.strSport).filter(Boolean) as string[])
    return ['All', ...Array.from(set)]
  }, [events])

  const filtered = useMemo(() => {
    if (sportFilter === 'All') return events
    return events.filter(e => e.strSport === sportFilter)
  }, [events, sportFilter])

  const active = filtered.find(e => e.idEvent === activeId) || filtered[0]
  const official = active?.strLeague
    ? OFFICIAL_EMBEDS.find(o => o.league.toLowerCase() === active.strLeague?.toLowerCase())
    : undefined
  const ytId = official?.url ? getYouTubeId(official.url) : null
  const eventYtId = active?.strVideo ? getYouTubeId(active.strVideo) : null
  const thumb = active?.strThumb

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <nav id="nav" className="solid">
        <div className="logo focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>VAULT<span>SPHERE</span></div>
        <div className="nav-center">
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>Home</span>
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/browse')} onKeyDown={onEnter(() => router.push('/browse'))}>Browse</span>
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/search')} onKeyDown={onEnter(() => router.push('/search'))}>Search</span>
          <span className="nav-link active focusable" role="button" tabIndex={0} onClick={() => router.push('/sports')} onKeyDown={onEnter(() => router.push('/sports'))}>Sports</span>
        </div>
        <div className="nav-right">
          <div className="avatar-btn focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>A</div>
        </div>
      </nav>

      <div className="sports-hero">
        <h1>Live <span>Sports</span></h1>
        <p>Today’s biggest games. We only embed official streams that permit iframe playback.</p>
      </div>

      <div className="sports-layout">
        <div className="sports-list">
          <div className="sports-filter-row">
            {sports.map(s => (
              <button
                key={s}
                className={`filter-chip ${sportFilter === s ? 'active' : ''}`}
                onClick={() => { setSportFilter(s); if (filtered[0]?.idEvent) setActiveId(filtered[0].idEvent) }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="sports-list-scroll">
            {loading && <div className="sports-empty">Loading today’s games…</div>}
            {!loading && filtered.length === 0 && (
              <div className="sports-empty">No popular games found for today.</div>
            )}
            {filtered.map((e) => (
              <button
                key={e.idEvent}
                className={`sports-list-item ${e.idEvent === active?.idEvent ? 'active' : ''}`}
                onClick={() => setActiveId(e.idEvent || null)}
              >
                <div className="sports-list-title">{e.strEvent || `${e.strHomeTeam} vs ${e.strAwayTeam}`}</div>
                <div className="sports-list-sub">{e.strLeague} · {e.strTime || 'TBD'}</div>
                {e.strStatus && <div className="sports-live">{e.strStatus}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="sports-player">
          <div className="sports-player-top">
            <div>
              <div className="sports-player-title">{active?.strEvent || 'Select a game'}</div>
              <div className="sports-player-sub">{active?.strLeague} · {active?.strTime || 'TBD'}</div>
            </div>
            {official?.url && (
              <button className="btn btn-outline" onClick={() => window.open(official.url, '_blank')}>Open Official ↗</button>
            )}
          </div>
          <div className="sports-iframe-wrap">
            {ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title={official?.title || 'Official Stream'}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
            ) : eventYtId ? (
              <iframe
                src={`https://www.youtube.com/embed/${eventYtId}`}
                title="Event Video"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="sports-no-embed" style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}>
                <div className="sports-no-embed-title">Live stream will appear here when officially available.</div>
                <div className="sports-no-embed-sub">We only embed official streams that permit iframe playback.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
