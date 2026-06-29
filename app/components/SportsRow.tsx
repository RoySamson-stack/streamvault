'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type ScheduleEvent = {
  category: string
  date: string
  time: string
  title: string
  channels: { id: string; name: string }[]
  start_unix?: number
}

export default function SportsRow() {
  const rowRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const scroll = (d: number) => rowRef.current?.scrollBy({ left: d * 320, behavior: 'smooth' })

  useEffect(() => {
    fetch('/api/live/schedule')
      .then(r => r.json())
      .then(data => setEvents((data.events || []).slice(0, 12)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!loading && events.length === 0) return null

  return (
    <section id="sports" style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2 }}>
          🏆 Live & Upcoming <span style={{ color: 'var(--accent)' }}>Sports</span>
        </div>
        <Link href="/sports" style={{
          background: 'rgba(229,9,20,.12)', color: '#e50914',
          border: '1px solid rgba(229,9,20,.3)', borderRadius: 20,
          padding: '3px 12px', fontSize: 10, fontWeight: 600, letterSpacing: 1,
          textDecoration: 'none',
        }}>WATCH LIVE →</Link>
      </div>

      <div style={{ position: 'relative' }}>
        <ScrollBtn dir={-1} onClick={() => scroll(-1)} />
        <div ref={rowRef} className="no-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ flexShrink: 0, width: 280, height: 140, borderRadius: 12, background: 'var(--surface2)', animation: 'pulse 1.5s infinite' }} />
          ))}
          {events.map((ev, i) => <LiveEventCard key={`${ev.title}-${i}`} event={ev} />)}
        </div>
        <ScrollBtn dir={1} onClick={() => scroll(1)} />
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </section>
  )
}

function LiveEventCard({ event }: { event: ScheduleEvent }) {
  return (
    <Link href="/sports" style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: 280, scrollSnapAlign: 'start' }}>
      <div style={{
        borderRadius: 12, background: 'var(--surface2)', border: '1px solid rgba(255,255,255,.07)',
        padding: 16, cursor: 'pointer', transition: 'all .25s', height: '100%',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e50914', animation: 'blink 1.5s infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: '#e50914', letterSpacing: 1 }}>{event.time}</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 'auto' }}>{event.category}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>{event.title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {event.channels.filter(c => c.id !== '00').map(c => c.name).join(', ') || 'Live channel'}
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </Link>
  )
}

function ScrollBtn({ dir, onClick }: { dir: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', top: '50%', [dir === -1 ? 'left' : 'right']: -18,
      transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%',
      background: 'rgba(15,15,26,.9)', border: '1px solid rgba(255,255,255,.15)',
      color: '#fff', cursor: 'pointer', fontSize: 22, zIndex: 5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', transition: 'all .2s',
    }}>{dir === -1 ? '‹' : '›'}</button>
  )
}
