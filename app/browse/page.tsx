'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { poster, backdrop, getGenreNames } from '@/lib/tmdb'

interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

interface TVShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  first_air_date: string
  vote_average: number
  genre_ids: number[]
}

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

export default function BrowsePage() {
  const [popular, setPopular] = useState<ContentItem[]>([])
  const [popularTV, setPopularTV] = useState<ContentItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const transformMovie = (m: Movie): ContentItem => ({
    id: String(m.id),
    title: m.title || '',
    poster: poster(m.poster_path),
    backdrop: backdrop(m.backdrop_path),
    rating: m.vote_average || 0,
    year: m.release_date ? parseInt(String(m.release_date).split('-')[0]) : 2024,
    genre: getGenreNames(m.genre_ids ?? []),
    type: 'movie',
    description: m.overview || '',
  })

  const transformTV = (t: TVShow): ContentItem => ({
    id: String(t.id),
    title: t.name || '',
    poster: poster(t.poster_path),
    backdrop: backdrop(t.backdrop_path),
    rating: t.vote_average || 0,
    year: t.first_air_date ? parseInt(String(t.first_air_date).split('-')[0]) : 2024,
    genre: getGenreNames(t.genre_ids ?? []),
    type: 'tv',
    description: t.overview || '',
  })

  useEffect(() => {
    async function fetchBrowse() {
      try {
        const [popularRes, popularTVRes] = await Promise.all([
          fetch(`/api/tmdb?endpoint=movie/popular`),
          fetch(`/api/tmdb?endpoint=tv/popular`),
        ])
        const [popularData, popularTVData] = await Promise.all([
          popularRes.json(), popularTVRes.json()
        ])
        setPopular(popularData.results?.map(transformMovie) || [])
        setPopularTV(popularTVData.results?.map(transformTV) || [])
      } catch (err) {
        console.error('Browse fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBrowse()
  }, [])

  const all = [...popular, ...popularTV]
  const filtered = (() => {
    if (selectedFilter === 'Movies') return all.filter(m => m.type === 'movie')
    if (selectedFilter === 'TV Shows') return all.filter(m => m.type === 'tv')
    if (['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Animation'].includes(selectedFilter)) {
      return all.filter(m => m.genre.includes(selectedFilter))
    }
    return all
  })()

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <nav id="nav" className="solid">
        <div className="logo focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>VAULT<span>SPHERE</span></div>
        <div className="nav-center">
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>Home</span>
          <span className="nav-link active focusable" role="button" tabIndex={0} onClick={() => router.push('/browse')} onKeyDown={onEnter(() => router.push('/browse'))}>Browse</span>
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/search')} onKeyDown={onEnter(() => router.push('/search'))}>Search</span>
          <span className="nav-link focusable" role="button" tabIndex={0} onClick={() => router.push('/sports')} onKeyDown={onEnter(() => router.push('/sports'))}>Sports</span>
        </div>
        <div className="nav-right">
          <div className="avatar-btn focusable" role="button" tabIndex={0} onClick={() => router.push('/')} onKeyDown={onEnter(() => router.push('/'))}>A</div>
        </div>
      </nav>

      <div className="browse-hero">
        <h1>Browse <span>Everything</span></h1>
        <p>Explore our full library of movies, series, documentaries and more.</p>
      </div>

      <div className="filter-bar">
        {['All', 'Movies', 'TV Shows', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Animation'].map(f => (
          <button key={f} className={`filter-chip ${selectedFilter === f ? 'active' : ''}`} onClick={() => setSelectedFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="browse-grid-section">
        <div className="browse-grid">
          {filtered.map((item) => (
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
                  <div className="card-over-meta">{item.genre[0]} · {item.year}</div>
                </div>
              </div>
              <div className="card-body"><div className="card-title">{item.title}</div><div className="card-year">{item.year}</div></div>
            </div>
          ))}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            No results for <strong>{selectedFilter}</strong>. Try another filter.
          </div>
        )}
      </div>

      <section className="sports-section">
        <div className="sports-head">
          <h2>Live <span>Sports</span></h2>
          <p>Today’s biggest games with official sources only.</p>
          <button className="btn btn-outline" onClick={() => router.push('/sports')}>Open Sports Hub →</button>
        </div>
        <div className="sports-grid">
          <div className="sports-card focusable" role="button" tabIndex={0} onKeyDown={onEnter(() => router.push('/sports'))} onClick={() => router.push('/sports')}>
            <div className="sports-badge">Today</div>
            <div className="sports-title">Top Leagues</div>
            <div className="sports-sub">F1, EPL, NBA, NFL, MLB, NHL, UFC, and more</div>
            <div className="sports-link">Browse today’s schedule →</div>
          </div>
          <div className="sports-card focusable" role="button" tabIndex={0} onKeyDown={onEnter(() => router.push('/sports'))} onClick={() => router.push('/sports')}>
            <div className="sports-badge">Official</div>
            <div className="sports-title">On‑Site Embeds</div>
            <div className="sports-sub">We only embed official streams that allow iframe</div>
            <div className="sports-link">Go to Sports Hub →</div>
          </div>
        </div>
      </section>
    </>
  )
}
  const onEnter = (action: () => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }
