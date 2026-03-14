'use client'
// components/ContentRow.tsx
import { useRef, ReactNode } from 'react'
import { ContentItem } from '@/lib/data'
import ContentCard from './ContentCard'

interface Props {
  title: ReactNode
  items: ContentItem[]
  cardSize?: 'sm' | 'md' | 'lg' | 'wide'
  showProgress?: boolean
  showRank?: boolean
  pill?: string
  tabs?: string[]
}

export default function ContentRow({ title, items, cardSize = 'md', showProgress, showRank, pill, tabs }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)

  function scroll(dir: number) {
    rowRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' })
  }

  return (
    <section style={{ padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tabs ? 18 : 22 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {pill && (
            <span style={{
              background: 'rgba(229,9,20,.12)', color: '#e50914',
              border: '1px solid rgba(229,9,20,.25)', borderRadius: 20,
              padding: '3px 12px', fontSize: 10, fontWeight: 600, letterSpacing: 1,
            }}>{pill}</span>
          )}
          <span
            style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'color .2s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'var(--muted)')}
          >See All →</span>
        </div>
      </div>

      {/* Optional tabs */}
      {tabs && (
        <GenreTabs tabs={tabs} />
      )}

      {/* Carousel */}
      <div style={{ position: 'relative' }}>
        <CarouselButton dir={-1} onClick={() => scroll(-1)} />
        <div
          ref={rowRef}
          className="no-scrollbar"
          style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}
        >
          {items.map((item, i) => (
            <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
              <ContentCard item={item} size={cardSize} showProgress={showProgress} rank={showRank ? i + 1 : undefined} />
              {showProgress && item.episode && (
                <div style={{ marginTop: 8, paddingLeft: 2 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{item.episode}</div>
                </div>
              )}
            </div>
          ))}
        </div>
        <CarouselButton dir={1} onClick={() => scroll(1)} />
      </div>
    </section>
  )
}

function CarouselButton({ dir, onClick }: { dir: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', top: '50%',
      [dir === -1 ? 'left' : 'right']: -18,
      transform: 'translateY(-50%)',
      width: 40, height: 40, borderRadius: '50%',
      background: 'rgba(15,15,26,.9)', border: '1px solid rgba(255,255,255,.15)',
      color: '#fff', cursor: 'pointer', fontSize: 22, lineHeight: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5, backdropFilter: 'blur(8px)', transition: 'all .2s',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.background = 'rgba(229,9,20,.3)'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,9,20,.5)'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.background = 'rgba(15,15,26,.9)'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.15)'
    }}
    >{dir === -1 ? '‹' : '›'}</button>
  )
}

function GenreTabs({ tabs }: { tabs: string[] }) {
  const ref = useRef<number>(0)

  return (
    <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 22 }}
      onClick={e => {
        const el = e.target as HTMLElement
        if (!el.dataset.tab) return
        const parent = el.parentElement!
        parent.querySelectorAll<HTMLElement>('[data-tab]').forEach(t => {
          t.style.background = 'transparent'; t.style.color = 'var(--muted)'
        })
        el.style.background = 'var(--accent)'; el.style.color = '#fff'
      }}
    >
      {tabs.map((tab, i) => (
        <button key={tab} data-tab={tab} style={{
          padding: '7px 18px', borderRadius: 7, fontSize: 12, fontWeight: 500,
          cursor: 'pointer', border: 'none', fontFamily: "'Outfit', sans-serif",
          background: i === 0 ? 'var(--accent)' : 'transparent',
          color: i === 0 ? '#fff' : 'var(--muted)',
          transition: 'all .2s',
        }}>{tab}</button>
      ))}
    </div>
  )
}
