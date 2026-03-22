'use client'
// components/HeroSection.tsx
import { useState, useEffect } from 'react'
import { HERO_SLIDES, HeroSlide } from '@/lib/data'
import { useRouter } from 'next/navigation'

export default function HeroSection({ slides }: { slides?: HeroSlide[] }) {
  const activeSlides: HeroSlide[] = slides && slides.length > 0 ? slides : HERO_SLIDES
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const t = setInterval(() => changeTo((current + 1) % activeSlides.length), 8000)
    return () => clearInterval(t)
  }, [current, activeSlides.length])

  function changeTo(i: number) {
    setAnimating(true)
    setTimeout(() => { setCurrent(i); setAnimating(false) }, 250)
  }

  const slide = activeSlides[current]
  const bgImage = slide?.backdrop || slide?.poster
  const metaBits = [
    slide?.rating ? `★ ${slide.rating}` : null,
    slide?.year ? String(slide.year) : null,
    slide?.runtime || null,
    slide?.pg || null,
  ].filter(Boolean) as string[]

  return (
    <section style={{
      position: 'relative',
      height: 'calc(70vh + var(--nav-h))',
      minHeight: 460,
      display: 'flex',
      alignItems: 'flex-end',
      overflow: 'hidden',
      paddingTop: 'var(--nav-h)',
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg,#0a0010 0%,#100020 35%,#1a0a00 70%,#0a0010 100%)',
      }} />
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(229,9,20,.18) 0%,transparent 70%)',
        top: -150, left: -100, animation: 'drift1 9s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute', width: 450, height: 450, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(255,107,53,.12) 0%,transparent 70%)',
        bottom: -80, right: 120, animation: 'drift2 11s ease-in-out infinite alternate',
      }} />

      {/* Poster image (right side) */}
      <div key={slide.id} style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '55%',
        background: bgImage
          ? `linear-gradient(to left,rgba(8,8,16,0) 0%,rgba(8,8,16,.5) 40%,rgba(8,8,16,.95) 70%,#080810 100%),
             url('${bgImage}') center/cover no-repeat`
          : 'linear-gradient(135deg,#0a0010 0%,#100020 35%,#1a0a00 70%,#0a0010 100%)',
        transition: 'opacity .3s',
        opacity: animating ? 0 : 1,
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 3,
        padding: '0 72px 60px',
        maxWidth: 620,
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity .3s, transform .3s',
      }}>
        {/* Live badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(229,9,20,.15)', border: '1px solid rgba(229,9,20,.4)',
          borderRadius: 20, padding: '4px 14px',
          fontSize: 11, fontWeight: 600, letterSpacing: '1.5px',
          color: '#e50914', marginBottom: 16,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#e50914',
            animation: 'blink 1.5s ease-in-out infinite',
          }} />
          NOW TRENDING
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: 72, lineHeight: .95, letterSpacing: 2,
          marginBottom: 14,
          textShadow: '0 2px 40px rgba(0,0,0,.8)',
        }}>
          {slide.title}
          {slide.subtitle && (
            <><br />
              <span style={{
                background: 'linear-gradient(135deg,#e50914,#ff6b35)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{slide.subtitle}</span>
            </>
          )}
        </h1>

        {/* Meta */}
        {metaBits.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, fontSize: 13, color: 'var(--muted)' }}>
            {metaBits.map((m, i) => (
              <span key={m + i} style={i === 0 && m.startsWith('★') ? { color: 'var(--gold)', fontWeight: 600 } : undefined}>
                {i > 0 && <Dot />} {m}
              </span>
            ))}
          </div>
        )}

        {/* Tags */}
        {slide.tags && slide.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {slide.tags.map(t => (
              <span key={t} style={{
                background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 20, padding: '3px 12px', fontSize: 11, color: 'var(--muted)', fontWeight: 500,
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Description */}
        {slide.description && (
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.7,
            marginBottom: 28, maxWidth: 460,
          }}>{slide.description}</p>
        )}

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '13px 30px', fontSize: 14, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif", cursor: 'pointer', letterSpacing: '.3px',
            transition: 'all .2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ff1a25'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
          onClick={() => slide?.id && router.push(`/watch/${slide.id}?type=movie`)}
          >
            ▶ Play Now
          </button>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,.1)', color: '#fff',
            border: '1px solid rgba(255,255,255,.18)', borderRadius: 8,
            padding: '13px 26px', fontSize: 14, fontWeight: 500,
            fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
            backdropFilter: 'blur(4px)', transition: 'background .2s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.18)')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)')}
          >
            + Watchlist
          </button>
        </div>

        {/* Slide dots */}
        <div style={{ display: 'flex', gap: 6 }}>
          {activeSlides.map((_, i) => (
            <button key={i} onClick={() => changeTo(i)} style={{
              width: i === current ? 36 : 24, height: 3, borderRadius: 2, border: 'none',
              background: i === current ? 'var(--accent)' : 'rgba(255,255,255,.25)',
              cursor: 'pointer', transition: 'all .35s',
            }} />
          ))}
        </div>
      </div>

      {/* CSS keyframes (injected once) */}
      <style>{`
        @keyframes drift1 { from{transform:translate(0,0) scale(1)} to{transform:translate(60px,40px) scale(1.1)} }
        @keyframes drift2 { from{transform:translate(0,0) scale(1)} to{transform:translate(-40px,-60px) scale(1.08)} }
        @keyframes blink  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.4)} }
      `}</style>
    </section>
  )
}

function Dot() {
  return <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--muted)', display: 'inline-block' }} />
}
