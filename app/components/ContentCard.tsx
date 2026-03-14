'use client'
// components/ContentCard.tsx
import { ContentItem } from '@/lib/data'

interface Props {
  item: ContentItem
  size?: 'sm' | 'md' | 'lg' | 'wide'
  showProgress?: boolean
  rank?: number
}

const WIDTHS = { sm: 140, md: 175, lg: 230, wide: 290 }

export default function ContentCard({ item, size = 'md', showProgress, rank }: Props) {
  const isWide = size === 'wide'
  const w = WIDTHS[size]
  const aspect = isWide ? '16/9' : '2/3'
  const imgW = isWide ? 400 : 200
  const imgH = isWide ? 225 : 300

  const badgeBg: Record<string, string> = {
    red: '#e50914', blue: '#1a6dff', gold: '#f5c518',
  }
  const badgeTxt: Record<string, string> = { red: '#fff', blue: '#fff', gold: '#000' }

  return (
    <div
      style={{ flexShrink: 0, width: w, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform .25s, box-shadow .25s' }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'scale(1.05)'
        el.style.zIndex = '10'
        el.style.boxShadow = '0 24px 64px rgba(0,0,0,.7)'
        el.querySelector<HTMLElement>('.card-overlay')!.style.opacity = '1'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = 'scale(1)'
        el.style.zIndex = '1'
        el.style.boxShadow = 'none'
        el.querySelector<HTMLElement>('.card-overlay')!.style.opacity = '0'
      }}
    >
      {/* Top-10 rank watermark */}
      {rank !== undefined && (
        <div style={{
          position: 'absolute', bottom: -10, left: -10, zIndex: 0,
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 110, lineHeight: 1,
          color: 'var(--surface2)', WebkitTextStroke: '2px rgba(255,255,255,.1)',
          pointerEvents: 'none', userSelect: 'none',
        }}>{rank}</div>
      )}

      <img
        src={`https://picsum.photos/seed/${item.seed}/${imgW}/${imgH}`}
        alt={item.title}
        loading="lazy"
        style={{
          width: '100%', aspectRatio: aspect, objectFit: 'cover',
          display: 'block', background: '#1a1a2e', position: 'relative', zIndex: 1,
        }}
      />

      {/* Badge */}
      {item.badge && (
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          background: badgeBg[item.badgeColor ?? 'red'],
          color: badgeTxt[item.badgeColor ?? 'red'],
          fontSize: 9, fontWeight: 700, padding: '3px 8px',
          borderRadius: 4, letterSpacing: '.5px',
        }}>{item.badge}</div>
      )}

      {/* Hover overlay */}
      <div className="card-overlay" style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to top,rgba(0,0,0,.95) 0%,rgba(0,0,0,.3) 50%,transparent 100%)',
        opacity: 0, transition: 'opacity .25s',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14,
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(229,9,20,.9)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', marginBottom: 8,
          color: '#fff', fontSize: 16,
        }}>▶</button>
        <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center', marginTop: 3 }}>
          <span style={{ color: 'var(--gold)' }}>★</span> {item.rating} · {item.year}
        </div>
      </div>

      {/* Progress bar (continue watching) */}
      {showProgress && item.progress !== undefined && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,.15)', zIndex: 4 }}>
          <div style={{ width: `${item.progress}%`, height: '100%', background: 'var(--accent)' }} />
        </div>
      )}
    </div>
  )
}
