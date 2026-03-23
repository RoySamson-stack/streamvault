'use client'

import { useEffect, useState, useRef } from 'react'
import { poster, backdrop, getGenreNames } from '@/lib/tmdb'

interface WatchHistoryItem {
  id: string
  title: string
  poster: string | null
  type: 'movie' | 'tv'
  progress: number
  lastWatched: string
}

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

interface Provider {
  name: string
  build: (type: string, id: string, season?: string, episode?: string) => string
  testUrl: string
}

const providers: Provider[] = [
  { name: 'VidBinge', build: (t, id, s, e) => t === 'movie' ? `https://vidbinge.to/movie/${id}` : `https://vidbinge.to/tv/${id}/${s || 1}/${e || 1}`, testUrl: 'https://vidbinge.to' },
  { name: 'VidSrc.to', build: (t, id, s, e) => t === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s || 1}/${e || 1}`, testUrl: 'https://vidsrc.to' },
  { name: 'vidsrcme', build: (t, id, s, e) => t === 'movie' ? `https://vidsrcme.ru/embed/movie?tmdb=${id}` : `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s || 1}&episode=${e || 1}`, testUrl: 'https://vidsrcme.ru' },
  { name: 'vembed', build: (t, id, s, e) => t === 'movie' ? `https://vembed.stream/play/${id}` : `https://vembed.stream/play/${id}?s=${s || 1}&e=${e || 1}`, testUrl: 'https://vembed.stream' },
  { name: 'MoviePla', build: (t, id, s, e) => t === 'movie' ? `https://moviepla.net/embed/${id}` : `https://moviepla.net/embed/${id}?season=${s || 1}&episode=${e || 1}`, testUrl: 'https://moviepla.net' },
  { name: '123Movies', build: (t, id, s, e) => t === 'movie' ? `https://www.123movies.life/embed/${id}` : `https://www.123movies.life/embed/${id}?season=${s || 1}&episode=${e || 1}`, testUrl: 'https://www.123movies.life' },
]

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

export default function HomePage() {
  const [trending, setTrending] = useState<ContentItem[]>([])
  const [popular, setPopular] = useState<ContentItem[]>([])
  const [topRated, setTopRated] = useState<ContentItem[]>([])
  const [anime, setAnime] = useState<ContentItem[]>([])
  const [heroItem, setHeroItem] = useState<ContentItem | null>(null)
  const [currentPage, setCurrentPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ContentItem[]>([])
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [settingsPanel, setSettingsPanel] = useState('account')
  const [profileTab, setProfileTab] = useState('watchlist')
  const [notifOpen, setNotifOpen] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<ContentItem | null>(null)
  const [embedUrl, setEmbedUrl] = useState('')
  const [currentProvider, setCurrentProvider] = useState(0)
  const [providerStates, setProviderStates] = useState<Record<number, { status: string; latency: number | null }>>({})
  const [playing, setPlaying] = useState(false)
  const [prog, setProg] = useState(32)
  const [toastMsg, setToastMsg] = useState('')
  const [toastType, setToastType] = useState('')
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerVideoRef = useRef<HTMLDivElement>(null)
  const testedRef = useRef(new Set())
  const [iframeKey, setIframeKey] = useState(0)
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    const saved = localStorage.getItem('vaultsphere_watch_history')
    if (saved) setWatchHistory(JSON.parse(saved))
  }, [])

  const updateWatchHistory = (item: ContentItem, progress: number) => {
    const newHistory = watchHistory.filter(h => h.id !== item.id)
    newHistory.unshift({
      id: item.id,
      title: item.title,
      poster: item.poster,
      type: item.type,
      progress,
      lastWatched: new Date().toISOString(),
    })
    const trimmed = newHistory.slice(0, 10)
    setWatchHistory(trimmed)
    localStorage.setItem('vaultsphere_watch_history', JSON.stringify(trimmed))
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingRes, popularRes, topRatedRes, animeRes] = await Promise.all([
          fetch(`/api/tmdb?endpoint=trending/movie/week`),
          fetch(`/api/tmdb?endpoint=movie/popular`),
          fetch(`/api/tmdb?endpoint=movie/top_rated`),
          fetch(`/api/tmdb?endpoint=discover/tv?with_origin_country=JP`),
        ])
        const [trendingData, popularData, topRatedData, animeData] = await Promise.all([
          trendingRes.json(), popularRes.json(), topRatedRes.json(), animeRes.json()
        ])

        const t = trendingData.results?.map(transformMovie) || []
        const p = popularData.results?.map(transformMovie) || []
        const tr = topRatedData.results?.map(transformMovie) || []
        const a = animeData.results?.map(transformMovie) || []

        setTrending(t)
        setPopular(p)
        setTopRated(tr)
        setAnime(a)
        if (t.length > 0) setHeroItem(t[0])
      } catch (err) {
        console.error('Failed to fetch TMDB data:', err)
      }
    }
    fetchData()
  }, [])

  const testProvider = async (index: number) => {
    if (testedRef.current.has(index)) return
    setProviderStates(prev => ({ ...prev, [index]: { status: 'testing', latency: null } }))
    try {
      const start = performance.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 3000)
      await fetch(providers[index].testUrl, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
      clearTimeout(timeout)
      const latency = Math.round(performance.now() - start)
      setProviderStates(prev => ({ ...prev, [index]: { status: 'ready', latency } }))
      testedRef.current.add(index)
    } catch {
      setProviderStates(prev => ({ ...prev, [index]: { status: 'failed', latency: null } }))
      testedRef.current.add(index)
    }
  }

  const selectFastest = () => {
    const ready = providers.map((_, i) => ({ index: i, state: providerStates[i] }))
      .filter(p => p.state?.status === 'ready' && p.state.latency !== null)
      .sort((a, b) => (a.state.latency || 999) - (b.state.latency || 999))
    if (ready.length > 0) setCurrentProvider(ready[0].index)
  }

  useEffect(() => {
    if (selectedMovie) {
      const url = providers[currentProvider]?.build(selectedMovie.type, selectedMovie.id) || ''
      setEmbedUrl(url)
      setIframeKey(k => k + 1)
      setLoading(true)
      providers.forEach((_, i) => testProvider(i))
      window.location.hash = `watch/${selectedMovie.id}`
    }
  }, [selectedMovie])

  useEffect(() => {
    const readyCount = Object.values(providerStates).filter(s => s?.status === 'ready').length
    if (readyCount > 0) {
      selectFastest()
    }
  }, [providerStates])

  useEffect(() => {
    if (selectedMovie) {
      setEmbedUrl(providers[currentProvider]?.build(selectedMovie.type, selectedMovie.id) || '')
    }
  }, [currentProvider])

  const toggleFullscreen = () => {
    const el = playerVideoRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen?.()
    }
  }

  useEffect(() => {
    const handleFsChange = () => {
      if (playerVideoRef.current) {
        playerVideoRef.current.classList.toggle('is-fullscreen', !!document.fullscreenElement)
      }
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const goToPage = (page: string) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
    setNotifOpen(false)
    if (page !== 'player') {
      setSelectedMovie(null)
      setPlaying(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) { setSearchResults([]); return }
    try {
      const res = await fetch(`/api/tmdb?endpoint=search/multi&query=${encodeURIComponent(query)}`)
      const data = await res.json()
      const results = data.results?.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv')?.slice(0, 12)
        ?.map((r: any) => ({
          id: String(r.id),
          title: r.title || r.name || '',
          poster: poster(r.poster_path),
          backdrop: backdrop(r.backdrop_path),
          rating: r.vote_average || 0,
          year: (r.release_date || r.first_air_date || '2024').split('-')[0],
          genre: [],
          type: r.media_type === 'movie' ? 'movie' : 'tv',
          description: r.overview || '',
        })) || []
      setSearchResults(results)
    } catch (err) { console.error('Search failed:', err) }
  }

  const handleWatch = (item: ContentItem) => {
    setSelectedMovie(item)
    setCurrentPage('player')
    setPlaying(false)
    const existingProgress = watchHistory.find(h => h.id === item.id)
    const progress = existingProgress?.progress || 0
    setProg(progress)
    updateWatchHistory(item, 0)
    window.location.hash = `watch/${item.id}`
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (hash.startsWith('#watch/')) {
      const movieId = hash.replace('#watch/', '')
      const foundMovie = trending.find(m => m.id === movieId) || popular.find(m => m.id === movieId) || topRated.find(m => m.id === movieId) || anime.find(m => m.id === movieId)
      if (foundMovie) {
        setSelectedMovie(foundMovie)
        setCurrentPage('player')
        setPlaying(false)
        const existingProgress = watchHistory.find(h => h.id === foundMovie.id)
        setProg(existingProgress?.progress || 0)
      }
    }
  }, [trending, popular, topRated, anime])

  const showToast = (msg: string, type = '') => {
    setToastMsg(msg)
    setToastType(type)
    setTimeout(() => { setToastMsg(''); setToastType('') }, 2800)
  }

  const getFilteredMovies = () => {
    if (selectedFilter === 'Movies') return popular.filter(m => m.type === 'movie')
    if (selectedFilter === 'TV Shows') return popular.filter(m => m.type === 'tv')
    return popular
  }

  const navScrolled = typeof window !== 'undefined' && window.scrollY > 60

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <nav id="nav" className={navScrolled ? 'scrolled' : 'solid'}>
        <div className="logo" onClick={() => goToPage('home')}>VAULT<span>SPHERE</span></div>
        <div className="nav-center">
          <span className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={() => goToPage('home')}>Home</span>
          <span className={`nav-link ${currentPage === 'browse' ? 'active' : ''}`} onClick={() => goToPage('browse')}>Browse</span>
          <span className={`nav-link ${currentPage === 'search' ? 'active' : ''}`} onClick={() => goToPage('search')}>Search</span>
          <span className={`nav-link ${currentPage === 'community' ? 'active' : ''}`} onClick={() => goToPage('community')}>Community</span>
          <span className={`nav-link ${currentPage === 'myspace' ? 'active' : ''}`} onClick={() => goToPage('myspace')}>My Space</span>
        </div>
        <div className="nav-right">
          <button className="nav-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span className="notif-dot"></span>
          </button>
          <button className="nav-icon-btn" onClick={() => goToPage('settings')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <div className="avatar-btn" onClick={() => goToPage('myspace')}>A</div>
        </div>
      </nav>

      <div className={`notif-dropdown ${notifOpen ? 'open' : ''}`}>
        <div className="nd-head"><h3>Notifications</h3><span onClick={() => showToast('All marked as read ✓')}>Mark all read</span></div>
        <div className="notif-item">
          <div className="notif-dot2"></div>
          <div className="notif-item-text"><h4>New Episode Available</h4><p>Breaking Bad — Episode 62 is now streaming</p><span>2 minutes ago</span></div>
        </div>
        <div className="notif-item">
          <div className="notif-dot2"></div>
          <div className="notif-item-text"><h4>Coming Soon</h4><p>New releases arriving this week</p><span>1 hour ago</span></div>
        </div>
      </div>

      <div className={`toast ${toastMsg ? 'show' : ''} ${toastType}`}>{toastMsg}</div>

      {/* HOME PAGE */}
      <div className={`page ${currentPage === 'home' ? 'active' : ''}`} id="page-home">
        <div className="hero">
          <div className="hero-bg" style={{ backgroundImage: heroItem?.backdrop ? `url(${heroItem.backdrop})` : "url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80')" }}></div>
          <div className="hero-grad"></div>
          <div className="hero-content">
            <div className="hero-eyebrow">Trending Now</div>
            <h1 className="hero-title">{heroItem?.title || 'Loading...'}</h1>
            <div className="hero-chips">
              <span className="hchip">{heroItem?.year || '2024'}</span>
              <span className="hdot"></span>
              {heroItem?.genre.slice(0, 2).map((g, i) => <span key={i} className="hchip">{g}</span>)}
              <span className="hdot"></span>
              <span className="hchip">⭐ {heroItem?.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <p className="hero-desc">{heroItem?.description?.slice(0, 200) || 'Discover unlimited entertainment on VaultSphere.'}</p>
            <div className="hero-btns">
              <button className="btn btn-gold" onClick={() => heroItem && handleWatch(heroItem)}>
                <svg style={{ width: 14, height: 14, fill: 'currentColor', stroke: 'none' }} viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
                Watch Now
              </button>
              <button className="btn btn-ghost" onClick={() => showToast('Added to Watchlist ✓', 'accent')}>+ Add to List</button>
              <button className="btn btn-outline" onClick={() => { if (heroItem) { setSelectedMovie(heroItem); setCurrentPage('detail') } }}>More Info</button>
            </div>
          </div>
        </div>

        <div className="home-sections">
          <div style={{ height: 36 }}></div>

          {watchHistory.length > 0 && (
            <div className="row-wrap">
              <div className="row-head"><span className="row-label">Continue <em>Watching</em></span><span className="row-all">See all</span></div>
              <div className="cards-scroll">
                {watchHistory.map((item) => {
                  const movie: ContentItem | undefined = trending.find(m => m.id === item.id) || popular.find(m => m.id === item.id) || anime.find(m => m.id === item.id)
                  if (!movie) return null
                  return (
                    <div key={item.id} className="wcard" onClick={() => handleWatch(movie as ContentItem)}>
                      <div className="wcard-img">
                        {item.poster ? <img src={item.poster} alt={item.title} /> : (
                          <div style={{ width: '100%', height: '100%', background: '#131920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#e8c96d', opacity: 0.55 }}>{item.title}</span>
                          </div>
                        )}
                        <div className="wcard-play"><div className="wcard-play-inner"><svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg></div></div>
                      </div>
                      <div className="pbar"><div className="pfill" style={{ width: `${item.progress}%` }}></div></div>
                      <div className="wcard-body"><div className="wcard-title">{item.title}</div><div className="wcard-sub">{item.progress}% watched</div></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="row-wrap">
            <div className="row-head"><span className="row-label">Trending <em>Now</em></span><span className="row-all">See all</span></div>
            <div className="cards-scroll">
              {trending.slice(0, 10).map((item) => (
                <div key={item.id} className="card" onClick={() => handleWatch(item)}>
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
          </div>

          <div className="row-wrap">
            <div className="row-head"><span className="row-label">Popular <em>Movies</em></span><span className="row-all" onClick={() => goToPage('browse')}>See all</span></div>
            <div className="cards-scroll">
              {popular.slice(0, 8).map((item) => (
                <div key={item.id} className="card" onClick={() => handleWatch(item)}>
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
          </div>

          <div className="row-wrap">
            <div className="row-head"><span className="row-label">Top <em>Rated</em></span><span className="row-all">See all</span></div>
            <div className="cards-scroll">
              {topRated.slice(0, 8).map((item) => (
                <div key={item.id} className="card" onClick={() => handleWatch(item)}>
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
          </div>

          <div className="row-wrap">
            <div className="row-head"><span className="row-label">Animation</span><span className="row-all">See all</span></div>
            <div className="cards-scroll">
              {anime.slice(0, 8).map((item) => (
                <div key={item.id} className="card" onClick={() => handleWatch(item)}>
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
          </div>
        </div>

        <footer className="site-footer">
          <div className="ft-grid">
            <div className="ft-brand"><span className="ft-logo">VAULT<span>SPHERE</span></span><p className="ft-tagline">Your gateway to unlimited entertainment.</p></div>
            <div className="ft-links-grid">
              <div className="ft-col"><h4>Browse</h4><a>Movies</a><a>TV Shows</a><a>New Releases</a><a>Coming Soon</a></div>
              <div className="ft-col"><h4>Genres</h4><a>Action</a><a>Drama</a><a>Comedy</a><a>Animation</a></div>
              <div className="ft-col"><h4>Account</h4><a>My Profile</a><a>Watchlist</a><a>Settings</a><a>Help</a></div>
              <div className="ft-col"><h4>Legal</h4><a>About</a><a>DMCA</a><a>Privacy</a><a>Terms</a></div>
            </div>
          </div>
          <div className="ft-bottom">
            <p className="ft-disclaimer">DISCLAIMER: Content is indexed from public sources. Contact hosting sites for removal requests.</p>
            <span className="ft-copy">VaultSphere <span>v1.0</span> · © 2026</span>
          </div>
        </footer>
      </div>

      {/* PLAYER PAGE */}
      <div className={`page ${currentPage === 'player' ? 'active' : ''}`} id="page-player">
        <div className="player-wrap">
          <div className={`player-video-area ${playing ? 'playing' : ''}`} ref={playerVideoRef} style={{ cursor: 'pointer' }}>
            <div className="player-fake-video">
              {selectedMovie?.backdrop && <img src={selectedMovie.backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />}
            </div>
            <div className="player-center-play" onClick={() => { setPlaying(true); setLoading(true); }}>
              <div className="play-big-btn">
                {loading ? (
                  <div className="spinner" />
                ) : playing ? (
                  <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
                )}
              </div>
              <span className="play-label">{loading ? 'Loading...' : playing ? 'Playing...' : 'Press to Play'}</span>
            </div>
            <div className="player-controls-overlay">
              <div className="player-progress"><div className="player-buffered" style={{ width: '78%' }}></div><div className="player-progress-fill" style={{ width: `${prog}%` }}></div></div>
              <div className="player-ctrl-row">
                <button className="ctrl-btn" onClick={() => { setPlaying(!playing); if (!playing) setLoading(true) }}>
                  {loading ? (
                    <div className="spinner-sm" />
                  ) : playing ? (
                    <svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" /><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
                  )}
                </button>
                <button className="ctrl-btn" title="Previous"><svg viewBox="0 0 24 24"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg></button>
                <button className="ctrl-btn" title="Next"><svg viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg></button>
                <div className="vol-wrap">
                  <button className="ctrl-btn" title="Mute"><svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></button>
                  <input type="range" className="vol-slider" min="0" max="100" defaultValue="75" />
                </div>
                <span className="time-disp">38:14 / 1:58:22</span>
                <div className="ctrl-spacer"></div>
                <span className="quality-btn">1080p</span>
                <button className="ctrl-btn" title="Fullscreen" onClick={toggleFullscreen}><svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
              </div>
            </div>
          </div>

          <div className="player-info-panel">
            <div className="player-title-area">
              <h1>{selectedMovie?.title || 'Select a title'}</h1>
              <p className="ep-info">{selectedMovie?.year} · {selectedMovie?.genre[0]} · HD</p>
              <div className="player-chips"><span className="hchip">⭐ {selectedMovie?.rating.toFixed(1)}</span></div>
              <p className="player-desc">{selectedMovie?.description || 'Enjoy unlimited streaming on VaultSphere.'}</p>
            </div>
            <div className="player-actions">
              <div className="player-action-row">
                <button className="btn btn-outline btn-sm btn-icon-sq" onClick={() => showToast('Added to Watchlist ✓', 'accent')}>♥</button>
                <button className="btn btn-outline btn-sm btn-icon-sq" onClick={() => showToast('Link copied! ✓', 'accent')}>⤵</button>
              </div>
              <button className="btn btn-ghost" onClick={() => setCurrentPage('detail')} style={{ fontSize: 11, padding: '9px 16px' }}>View Details →</button>
              <button className="btn btn-ghost" onClick={() => goToPage('home')} style={{ fontSize: 11, padding: '9px 16px' }}>← Back to Home</button>
            </div>
          </div>

          <div className="episodes-panel">
            <h3>Streaming Sources</h3>
            <div className="cards-scroll" style={{ gap: 8 }}>
              {providers.map((p, i) => (
                <button key={p.name} onClick={() => { setCurrentProvider(i); setIframeKey(k => k + 1); setLoading(true) }} style={{
                  padding: '8px 14px', borderRadius: 6,
                  border: i === currentProvider ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: i === currentProvider ? 'rgba(232,201,109,0.15)' : 'var(--surface2)',
                  color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>{p.name}</span>
                  {providerStates[i]?.status === 'ready' && <span style={{ fontSize: 10, color: '#4ade80' }}>✓</span>}
                  {providerStates[i]?.status === 'testing' && <span style={{ fontSize: 10, color: '#f5c518' }}>⚡</span>}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 20, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
              <iframe key={iframeKey} ref={iframeRef} src={embedUrl} style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; allowfullscreen" referrerPolicy="no-referrer" allowFullScreen
                onLoad={() => setLoading(false)} />
            </div>
          </div>
        </div>
      </div>

      {/* BROWSE PAGE */}
      <div className={`page ${currentPage === 'browse' ? 'active' : ''}`} id="page-browse">
        <div className="browse-hero"><h1>Browse <span>Everything</span></h1><p>Explore our full library of movies, series, documentaries and more.</p></div>
        <div className="filter-bar">
          {['All', 'Movies', 'TV Shows', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Animation'].map(f => (
            <button key={f} className={`filter-chip ${selectedFilter === f ? 'active' : ''}`} onClick={() => setSelectedFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="browse-grid-section">
          <div className="browse-grid">
            {getFilteredMovies().map((item) => (
              <div key={item.id} className="card" onClick={() => handleWatch(item)}>
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
        </div>
      </div>

      {/* SEARCH PAGE */}
      <div className={`page ${currentPage === 'search' ? 'active' : ''}`} id="page-search">
        <div className="search-page">
          <div className="search-top"><h1>Find <span>Anything</span></h1><p>Millions of movies, shows, anime, documentaries and more</p></div>
          <div className="big-search">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search titles, genres, actors, directors…" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          </div>
          {searchQuery.length >= 2 ? (
            <div style={{ maxWidth: 980, margin: '0 auto' }}>
              <div className="search-results-title">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</div>
              <div className="search-results-grid">
                {searchResults.map((item) => (
                  <div key={item.id} className="card" onClick={() => handleWatch(item)}>
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
            </div>
          ) : (
            <>
              <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--muted)', marginBottom: 20, fontWeight: 600, textAlign: 'center' }}>Browse by Genre</h3>
              <div className="genre-mosaic">
                {GENRES.map((g) => (
                  <div key={g.name} className="gmosaic-card" data-icon={g.icon} style={{ background: g.bg, borderColor: `${g.c}22`, color: g.c }} onClick={() => goToPage('browse')}>
                    <div className="gmosaic-label">{g.name}</div>
                    <div className="gmosaic-count">{g.count}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* DETAIL PAGE */}
      <div className={`page ${currentPage === 'detail' ? 'active' : ''}`} id="page-detail">
        {selectedMovie && (
          <>
            <div className="detail-hero">
              <div className="detail-hero-bg" style={{ backgroundImage: selectedMovie.backdrop ? `url(${selectedMovie.backdrop})` : undefined }}></div>
              <div className="detail-grad"></div>
              <div className="detail-content">
                <div className="badge-row"><span className="imdb-b">IMDb</span><span className="star-row">★★★★☆</span><span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 14 }}>{selectedMovie.rating.toFixed(1)}</span><span className="rt-badge">HD</span></div>
                <h1 className="detail-title">{selectedMovie.title}</h1>
                <div className="detail-chips">
                  <span className="dchip">{selectedMovie.year}</span>
                  {selectedMovie.genre.slice(0, 3).map((g, i) => <span key={i} className="dchip">{g}</span>)}
                </div>
                <p className="detail-desc">{selectedMovie.description}</p>
                <div className="detail-btns">
                  <button className="btn btn-gold" onClick={() => handleWatch(selectedMovie)}>
                    <svg style={{ width: 14, height: 14, fill: 'currentColor', stroke: 'none' }} viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z"/></svg>
                    Watch Now
                  </button>
                  <button className="btn btn-ghost" onClick={() => showToast('Added to Watchlist ✓', 'accent')}>+ Watchlist</button>
                </div>
              </div>
            </div>
            <div className="detail-body">
              <div>
                <div className="detail-tabs"><span className="dtab active">Details</span><span className="dtab">Cast</span><span className="dtab">Reviews</span></div>
                <div className="dtab-content active">
                  <div className="dt-section"><h3>Film Information</h3></div>
                  <div className="info-rows">
                    <div className="ir"><span className="ir-label">Released</span><span className="ir-val">{selectedMovie.year}</span></div>
                    <div className="ir"><span className="ir-label">Genre</span><span className="ir-val">{selectedMovie.genre.join(' · ')}</span></div>
                    <div className="ir"><span className="ir-label">Rating</span><span className="ir-val">⭐ {selectedMovie.rating.toFixed(1)} / 10</span></div>
                    <div className="ir"><span className="ir-label">Overview</span><span className="ir-val">{selectedMovie.description}</span></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="dt-section"><h3>More Like This</h3></div>
                {trending.slice(1, 6).map((item) => (
                  <div key={item.id} className="sim-item" onClick={() => { setSelectedMovie(item); setCurrentPage('detail') }}>
                    <div className="sim-thumb">
                      {item.poster ? <img src={item.poster} alt={item.title} /> : (
                        <div style={{ width: '100%', height: '100%', background: '#131920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: '#e8c96d', opacity: 0.55 }}>{item.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="sim-info"><h4>{item.title}</h4><p>{item.year}</p><div className="sim-rate">⭐ {item.rating.toFixed(1)}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* COMMUNITY PAGE */}
      <div className={`page ${currentPage === 'community' ? 'active' : ''}`} id="page-community">
        <div className="community-wrap">
          <div className="comm-header"><h1>Community <span>Hub</span></h1><p>Discover what the world is watching, rating, and reviewing right now.</p></div>
          <div className="comm-layout">
            <div>
              <div className="feed-tabs"><span className="ftab active">For You</span><span className="ftab">Popular</span><span className="ftab">New Reviews</span></div>
              <div className="activity-card">
                <div className="act-head">
                  <div className="act-av" style={{ background: 'rgba(232,201,109,0.1)', color: 'var(--accent)' }}>M</div>
                  <div className="act-user"><h4>Marcus O.</h4><p>2h ago · Reviewed</p></div>
                  <div style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 12, letterSpacing: 1 }}>★★★★★</div>
                </div>
                <div className="act-movie-strip" onClick={() => trending[1] && handleWatch(trending[1])}>
                  <div className="act-movie-th">
                    {trending[1]?.poster ? <img src={trending[1].poster} alt="" /> : (
                      <div style={{ width: '100%', height: '100%', background: '#1a2230', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, color: '#e8c96d', opacity: 0.7 }}>{trending[1]?.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="act-movie-info"><h4>{trending[1]?.title || 'Loading...'}</h4><p>{trending[1]?.year}</p></div>
                </div>
                <p className="act-quote">Incredible film! A must-watch for anyone who loves great storytelling.</p>
                <div className="act-foot">
                  <button className="act-foot-btn" onClick={() => showToast('Liked!')}>👍 42</button>
                  <button className="act-foot-btn" onClick={() => showToast('Reply box open...')}>💬 Reply</button>
                </div>
              </div>
            </div>
            <div>
              <div className="sidebar-widget">
                <div className="sw-title">Trending This Week</div>
                {trending.slice(0, 5).map((item, i) => (
                  <div key={item.id} className="trend-list-item" onClick={() => handleWatch(item)}>
                    <div className="trend-rank">{String(i + 1).padStart(2, '0')}</div>
                    <div className="trend-details"><h4>{item.title}</h4><p>{item.genre[0]} · {item.year}</p></div>
                    <div className="trend-thumb-sm">
                      {item.poster ? <img src={item.poster} alt="" /> : <div style={{ width: '100%', height: '100%', background: '#131920' }}></div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="staff-pick">
                <div className="sp-label">🔥 Staff Pick of the Week</div>
                <div className="sp-title">{trending[0]?.title || 'Loading...'}</div>
                <p className="sp-desc">A stunning film that delivers on every level. Don't miss it!</p>
                <button className="btn btn-gold" onClick={() => trending[0] && handleWatch(trending[0])} style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: 11 }}>Watch Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MY SPACE PAGE */}
      <div className={`page ${currentPage === 'myspace' ? 'active' : ''}`} id="page-myspace">
        <div className="myspace-wrap">
          <div className="profile-banner"><div className="profile-banner-decoration">VS</div></div>
          <div className="profile-main">
            <div className="profile-card">
              <div className="profile-av-lg-lg">A</div>
              <div className="profile-name-area"><h1>Alex Viewer</h1><p>Member since 2024 · VaultSphere Member</p></div>
              <div className="profile-stats-row">
                <div className="pstat"><div className="pstat-num">247</div><div className="pstat-label">Watched</div></div>
                <div className="pstat"><div className="pstat-num">{watchHistory.length}</div><div className="pstat-label">In Progress</div></div>
                <div className="pstat"><div className="pstat-num">31</div><div className="pstat-label">Reviews</div></div>
                <div className="pstat"><div className="pstat-num">612h</div><div className="pstat-label">Watch Time</div></div>
              </div>
            </div>
          </div>
          <div className="profile-tabs">
            <span className={`ptab ${profileTab === 'watchlist' ? 'active' : ''}`} onClick={() => setProfileTab('watchlist')}>Watchlist</span>
            <span className={`ptab ${profileTab === 'history' ? 'active' : ''}`} onClick={() => setProfileTab('history')}>History</span>
            <span className={`ptab ${profileTab === 'reviews' ? 'active' : ''}`} onClick={() => setProfileTab('reviews')}>My Reviews</span>
            <span className={`ptab ${profileTab === 'prefs' ? 'active' : ''}`} onClick={() => setProfileTab('prefs')}>Preferences</span>
          </div>

          <div className={`ptab-content ${profileTab === 'watchlist' ? 'active' : ''}`}>
            <div className="wl-grid">
              {trending.slice(0, 8).map((item) => (
                <div key={item.id} className="card" onClick={() => handleWatch(item)}>
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
          </div>

          <div className={`ptab-content ${profileTab === 'history' ? 'active' : ''}`}>
            <div className="history-list">
              {watchHistory.map((item) => (
                <div key={item.id} className="hi" onClick={() => { const m = trending.find(t => t.id === item.id) || popular.find(t => t.id === item.id); if (m) handleWatch(m) }}>
                  <div className="hi-thumb">
                    {item.poster ? <img src={item.poster} alt={item.title} /> : (
                      <div style={{ width: '100%', height: '100%', background: '#131920', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 14, color: '#e8c96d', opacity: 0.7 }}>{item.title}</span>
                      </div>
                    )}
                  </div>
                  <div className="hi-info"><h4>{item.title}</h4><p>{item.progress}% watched</p><div className="hi-prog pbar" style={{ marginTop: 6 }}><div className="pfill" style={{ width: `${item.progress}%` }}></div></div></div>
                  <div className="hi-when">{new Date(item.lastWatched).toLocaleDateString()}</div>
                </div>
              ))}
              {watchHistory.length === 0 && <p style={{ color: 'var(--muted)', padding: 20 }}>No watch history yet. Start watching something!</p>}
            </div>
          </div>

          <div className={`ptab-content ${profileTab === 'reviews' ? 'active' : ''}`}>
            <div className="review-card">
              <div className="rev-head">
                <div className="rev-movie-info">
                  <div className="rev-thumb"></div>
                  <div><div className="rev-title">{trending[0]?.title}</div><div className="rev-year">{trending[0]?.year}</div></div>
                </div>
                <div className="rev-stars">★★★★★</div>
              </div>
              <p className="rev-text">Amazing film! The storytelling is incredible and the performances are top-notch.</p>
              <div className="rev-date">Written 2 weeks ago</div>
            </div>
          </div>

          <div className={`ptab-content ${profileTab === 'prefs' ? 'active' : ''}`}>
            <div className="pref-section">
              <h3>Playback</h3>
              <div className="pref-row">
                <div className="pref-label"><h4>Auto-play next episode</h4><p>Automatically start the next episode when one ends</p></div>
                <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
              </div>
              <div className="pref-row">
                <div className="pref-label"><h4>Default quality</h4><p>Preferred streaming quality</p></div>
                <select className="select-pref" defaultValue="1080p">
                  <option value="auto">Auto</option>
                  <option value="1080p">1080p HD</option>
                  <option value="4k">4K Ultra HD</option>
                </select>
              </div>
            </div>
            <div className="pref-section">
              <h3>Notifications</h3>
              <div className="pref-row">
                <div className="pref-label"><h4>New episodes</h4><p>Get notified when new episodes drop</p></div>
                <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SETTINGS PAGE */}
      <div className={`page ${currentPage === 'settings' ? 'active' : ''}`} id="page-settings">
        <div className="settings-wrap">
          <div className="settings-sidebar">
            <h3>Settings</h3>
            <div className={`settings-nav-item ${settingsPanel === 'account' ? 'active' : ''}`} onClick={() => setSettingsPanel('account')}>
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account
            </div>
            <div className={`settings-nav-item ${settingsPanel === 'subscription' ? 'active' : ''}`} onClick={() => setSettingsPanel('subscription')}>
              <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Subscription
            </div>
            <div className={`settings-nav-item ${settingsPanel === 'playback' ? 'active' : ''}`} onClick={() => setSettingsPanel('playback')}>
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Playback
            </div>
            <div className={`settings-nav-item ${settingsPanel === 'privacy' ? 'active' : ''}`} onClick={() => setSettingsPanel('privacy')}>
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Privacy & Security
            </div>
          </div>

          <div className="settings-body">
            <div className={`s-panel ${settingsPanel === 'account' ? 'active' : ''}`}>
              <h2>Account</h2><p>Manage your profile, email, and password</p>
              <div className="settings-divider"></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                <div className="profile-av-lg">A</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Alex Viewer</div>
                  <div style={{ fontSize: 13, color: 'var(--muted2)' }}>alex.viewer@email.com</div>
                  <div style={{ marginTop: 8 }}><span className="plan-badge">Premium Plan</span></div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => showToast('Profile updated ✓', 'accent')}>Edit Profile</button>
              </div>
              <div className="settings-group">
                <div className="settings-row">
                  <div className="sr-label"><h4>Display Name</h4><p>Shown on reviews and community posts</p></div>
                  <div className="sr-control"><input className="form-input" defaultValue="Alex Viewer" style={{ width: 200, padding: '8px 12px', fontSize: 13 }} /></div>
                </div>
                <div className="settings-row">
                  <div className="sr-label"><h4>Email Address</h4><p>Used for sign-in and notifications</p></div>
                  <div className="sr-control"><input className="form-input" defaultValue="alex.viewer@email.com" style={{ width: 240, padding: '8px 12px', fontSize: 13 }} /></div>
                </div>
              </div>
              <div style={{ marginTop: 24 }}><button className="btn btn-gold" onClick={() => showToast('Changes saved ✓', 'accent')}>Save Changes</button></div>
            </div>

            <div className={`s-panel ${settingsPanel === 'subscription' ? 'active' : ''}`}>
              <h2>Subscription</h2><p>Your plan, billing, and payment methods</p>
              <div className="settings-divider"></div>
              <div style={{ background: 'linear-gradient(135deg,rgba(232,201,109,0.08),rgba(192,57,43,0.04))', border: '1px solid rgba(232,201,109,0.2)', borderRadius: 8, padding: 24, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>Current Plan</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 1 }}>Premium</div>
                    <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 2 }}>$14.99/month</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => showToast('Plan management...')}>Manage Plan</button>
                </div>
              </div>
            </div>

            <div className={`s-panel ${settingsPanel === 'playback' ? 'active' : ''}`}>
              <h2>Playback</h2><p>Control how videos play across your devices</p>
              <div className="settings-divider"></div>
              <div className="settings-group">
                <div className="settings-row">
                  <div className="sr-label"><h4>Streaming Quality</h4><p>Higher quality uses more data</p></div>
                  <div className="sr-control">
                    <select className="select-pref" defaultValue="1080p">
                      <option value="auto">Auto (Recommended)</option>
                      <option value="1080p">1080p HD</option>
                      <option value="4k">4K Ultra HD</option>
                    </select>
                  </div>
                </div>
                <div className="settings-row">
                  <div className="sr-label"><h4>Auto-play Next Episode</h4><p>Start next episode automatically</p></div>
                  <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                </div>
              </div>
              <div style={{ marginTop: 24 }}><button className="btn btn-gold" onClick={() => showToast('Playback settings saved ✓', 'accent')}>Save Changes</button></div>
            </div>

            <div className={`s-panel ${settingsPanel === 'privacy' ? 'active' : ''}`}>
              <h2>Privacy & Security</h2><p>Control your data and account security settings</p>
              <div className="settings-divider"></div>
              <div className="settings-group">
                <div className="settings-row">
                  <div className="sr-label"><h4>Watch History</h4><p>Allow tracking for recommendations</p></div>
                  <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                </div>
                <div className="settings-row">
                  <div className="sr-label"><h4>Public Profile</h4><p>Let others see your activity</p></div>
                  <label className="toggle"><input type="checkbox" defaultChecked /><span className="toggle-slider"></span></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
