'use client'
// components/SportsRow.tsx
import { useRef } from 'react'
import { SPORT_EVENTS, SportEvent } from '@/lib/data'

export default function SportsRow() {
  const rowRef = useRef<HTMLDivElement>(null)
  const scroll = (d: number) => rowRef.current?.scrollBy({ left: d * 360, behavior: 'smooth' })

  return (
    <section id="sports" style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2 }}>
          🏆 Live & Upcoming <span style={{ color: 'var(--accent)' }}>Sports</span>
        </div>
        <span style={{
          background: 'rgba(229,9,20,.12)', color: '#e50914',
          border: '1px solid rgba(229,9,20,.3)', borderRadius: 20,
          padding: '3px 12px', fontSize: 10, fontWeight: 600, letterSpacing: 1,
        }}>LIVE NOW</span>
      </div>

      {/* Sport tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 22 }}>
        {['All', 'Football', 'Basketball', 'Tennis', 'F1', 'MMA'].map((t, i) => (
          <button key={t} style={{
            padding: '7px 18px', borderRadius: 7, fontSize: 12, fontWeight: 500,
            cursor: 'pointer', border: 'none', fontFamily: "'Outfit', sans-serif",
            background: i === 0 ? 'var(--accent)' : 'transparent',
            color: i === 0 ? '#fff' : 'var(--muted)', transition: 'all .2s',
          }}
          onClick={e => {
            (e.currentTarget.parentElement as HTMLElement).querySelectorAll<HTMLElement>('button').forEach(b => { b.style.background = 'transparent'; b.style.color = 'var(--muted)' })
            ;(e.currentTarget as HTMLElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = '#fff'
          }}
          >{t}</button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <ScrollBtn dir={-1} onClick={() => scroll(-1)} />
        <div ref={rowRef} className="no-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
          {SPORT_EVENTS.map(ev => <SportCard key={ev.id} event={ev} />)}
        </div>
        <ScrollBtn dir={1} onClick={() => scroll(1)} />
      </div>
    </section>
  )
}

function SportCard({ event: ev }: { event: SportEvent }) {
  const isLive = ev.status === 'LIVE'
  const statusColor = { LIVE: '#e50914', TODAY: '#f5c518', FT: 'var(--muted)', TOMORROW: '#1a6dff' }[ev.status]

  return (
    <div style={{
      flexShrink: 0, width: 280, borderRadius: 12,
      background: 'var(--surface2)', border: '1px solid rgba(255,255,255,.07)',
      overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start',
      transition: 'all .25s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,9,20,.3)'
      ;(e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,.4)'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'
      ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
    }}
    >
      <img src={`https://picsum.photos/seed/${ev.seed}/400/225`} alt={ev.league} loading="lazy"
        style={{ width: '100%', height: 155, objectFit: 'cover', display: 'block' }} />
      <div style={{ padding: 14 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10,
          background: isLive ? 'rgba(229,9,20,.15)' : 'rgba(255,255,255,.06)',
          border: `1px solid ${statusColor}44`,
          borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 600, color: statusColor,
        }}>
          {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e50914', animation: 'blink 1.5s infinite' }} />}
          {ev.status}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.home}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: 'var(--accent)' }}>{ev.score}</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.away}</div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ev.league}</div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
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
