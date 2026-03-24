'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { poster, backdrop, getGenreNames } from '@/lib/tmdb'

interface ContentItem {
  id: string
  title: string
  poster: string | null
  backdrop: string | null
  rating: number
  year: number
  genre: string[]
  type: 'movie' | 'tv'
  description: string
}

const GENRES = [
  { name: 'Action', icon: '🎬', bg: '#0d1525', c: '#7c9cf7', count: '2,841 titles' },
  { name: 'Comedy', icon: '😂', bg: '#1f1a0d', c: '#f7c97c', count: '3,120 titles' },
  { name: 'Drama', icon: '🎭', bg: '#0d1a14', c: '#7cf7c9', count: '4,221 titles' },
  { name: 'Horror', icon: '👻', bg: '#0d0d1a', c: '#9c7cf7', count: '987 titles' },
  { name: 'Sci-Fi', icon: '🚀', bg: '#0d1620', c: '#7cdaf7', count: '1,342 titles' },
  { name: 'Romance', icon: '💘', bg: '#1a0d0e', c: '#f79c7c', count: '2,009 titles' },
  { name: 'Thriller', icon: '⚡', bg: '#1a150d', c: '#f7dc7c', count: '1,567 titles' },
  { name: 'Animation', icon: '🎪', bg: '#0d1a1a', c: '#7cf7f0', count: '2,453 titles' },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onEnter = (action: () => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb?endpoint=search/multi&query=${encodeURIComponent(q)}`)
        const data = await res.json()
        const results = data.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')?.slice(0, 24)
          ?.map((r: any) => ({
            id: String(r.id),
            title: r.title || r.name || '',
            poster: poster(r.poster_path),
            backdrop: backdrop(r.backdrop_path),
            rating: r.vote_average || 0,
            year: (r.release_date || r.first_air_date || '2024').split('-')[0],
            genre: getGenreNames(r.genre_ids ?? []),
            type: r.media_type === 'movie' ? 'movie' : 'tv',
            description: r.overview || '',
          })) || []
        setSearchResults(results)
      } catch (err) {
        console.error('Search failed:', err)
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <nav id="nav" className="solid">
        <div className="logo focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>VAULT<span>SPHERE</span></div>
        <div className="nav-center">
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>Home</span>
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/browse')} onKeyDown={onEnter(() => router.push('/browse'))}>Browse</span>
          <span className="nav-link active focusable" role="button" tabIndex={0} onClick={() => router.push('/search')} onKeyDown={onEnter(() => router.push('/search'))}>Search</span>
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/sports')} onKeyDown={onEnter(() => router.push('/sports'))}>Sports</span>
        </div>
        <div className="nav-right">
          <div className="avatar-btn focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>A</div>
        </div>
      </nav>

      <div className="search-page">
        <div className="search-top"><h1>Find <span>Anything</span></h1><p>Millions of movies, shows, anime, documentaries and more</p></div>
        <div className="big-search">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search titles, genres, actors, directors…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        {searchQuery.length >= 2 ? (
          <div style={{ maxWidth: 980, margin: '0 auto' }}>
            <div className="search-results-title">{loading ? 'Searching…' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery}"`}</div>
            <div className="search-results-grid">
              {searchResults.map((item) => (
                <div key={item.id} className="card focusable" role="button" tabIndex={0} onClick={() => { window.location.href = `/watch/${item.id}?type=${item.type}` }} onKeyDown={onEnter(() => { window.location.href = `/watch/${item.id}?type=${item.type}` })}>
                  <div className="card-img">
                    {item.poster ? <img src={item.poster} alt={item.title} loading="lazy" /> : (
                      <div style={{ width: '100%', height: '100%', background: '#131920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#e8c96d', opacity: 0.45, textAlign: 'center', padding: 10 }}>{item.title}</span>
                      </div>
                    )}
                    <div className="card-rate">⭐ {item.rating.toFixed(1)}</div>
                    <div className="card-over">
                      <div className="card-play-circle"><svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg></div>
                      <div className="card-over-title">{item.title}</div>
                      <div className="card-over-meta">{item.year}</div>
                    </div>
                  </div>
                  <div className="card-body"><div className="card-title">{item.title}</div><div className="card-year">{item.year}</div></div>
                </div>
              ))}
            </div>
            {!loading && searchResults.length === 0 && (
              <div className="empty-state">
                No matches for <strong>{searchQuery}</strong>. Try another title or genre.
              </div>
            )}
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 20, fontWeight: 600, textAlign: 'center' }}>Browse by Genre</h3>
            <div className="genre-mosaic">
              {GENRES.map((g) => (
                <div key={g.name} className="gmosaic-card focusable" role="button" tabIndex={0} data-icon={g.icon} style={{ background: g.bg, borderColor: `${g.c}22`, color: g.c }} onClick={() => router.push('/browse')} onKeyDown={onEnter(() => router.push('/browse'))}>
                  <div className="gmosaic-label">{g.name}</div>
                  <div className="gmosaic-count">{g.count}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
