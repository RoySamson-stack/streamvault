'use client'
// components/Navbar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type SearchResult = {
  id: number
  title: string
  year?: number
  media_type: 'movie' | 'tv'
  poster: string | null
  rating?: number
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const showResults = searchOpen && (query.trim().length > 0 || results.length > 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(Array.isArray(data?.results) ? data.results : [])
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: 'var(--nav-h)',
      background: scrolled
        ? 'rgba(8,8,16,0.97)'
        : 'linear-gradient(to bottom,rgba(8,8,16,0.9) 0%,transparent 100%)',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none',
      transition: 'background 0.3s, backdrop-filter 0.3s',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 3,
        background: 'linear-gradient(135deg,#e50914,#ff6b35)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        textDecoration: 'none',
      }}>StreamVault</Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {[
          { label: 'Home', href: '/' },
          { label: 'Movies', href: '#movies' },
          { label: 'Series', href: '#series' },
          { label: 'Sports', href: '#sports' },
          { label: 'Anime', href: '#anime' },
          { label: 'Live TV', href: '#live' },
        ].map(({ label, href }) => (
          <a key={label} href={href} style={{
            color: 'var(--muted)', textDecoration: 'none',
            fontSize: 13, fontWeight: 500, letterSpacing: '.4px',
            transition: 'color .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >{label}</a>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <input
          placeholder="🔍  Search titles…"
          value={query}
          onChange={e => setQuery(e.currentTarget.value)}
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '7px 16px',
            color: '#fff', fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            outline: 'none', width: searchOpen ? 260 : 150,
            transition: 'width .3s, border-color .3s',
          }}
          onFocus={e => {
            setSearchOpen(true)
            e.currentTarget.style.borderColor = 'rgba(229,9,20,.5)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            setTimeout(() => setSearchOpen(false), 150)
          }}
        />

        {showResults && (
          <div style={{
            position: 'absolute', top: 44, right: 0, width: 360,
            background: 'rgba(12,12,20,.98)', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 12, overflow: 'hidden', zIndex: 200,
            boxShadow: '0 20px 60px rgba(0,0,0,.5)',
          }}>
            <div style={{ padding: '10px 12px', fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              {loading ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'}`}
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {results.map(r => (
                <button
                  key={`${r.media_type}-${r.id}`}
                  onClick={() => {
                    setSearchOpen(false)
                    setQuery('')
                    setResults([])
                    router.push(`/watch/${r.id}?type=${r.media_type}`)
                  }}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none',
                    background: 'transparent', color: '#fff', cursor: 'pointer',
                    display: 'flex', gap: 10, padding: 10,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{
                    width: 48, height: 72, borderRadius: 6, overflow: 'hidden',
                    background: 'rgba(255,255,255,.05)', flexShrink: 0,
                  }}>
                    {r.poster && (
                      <img src={r.poster} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {r.media_type.toUpperCase()} {r.year ? `· ${r.year}` : ''} {r.rating ? `· ★ ${r.rating.toFixed(1)}` : ''}
                    </div>
                  </div>
                </button>
              ))}
              {!loading && results.length === 0 && (
                <div style={{ padding: 14, fontSize: 12, color: 'var(--muted)' }}>
                  No results yet.
                </div>
              )}
            </div>
          </div>
        )}
        {/* Notifications bell */}
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: 18, lineHeight: 1,
          transition: 'color .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >🔔</button>
        {/* Avatar / profile */}
        <Link href="/auth/login" style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg,#e50914,#ff6b35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          textDecoration: 'none', cursor: 'pointer',
        }}>J</Link>
      </div>
    </nav>
  )
}
