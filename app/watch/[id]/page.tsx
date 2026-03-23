'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { poster, backdrop } from '@/lib/tmdb'

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

  const providers = [
  { name: 'zxcstream', build: (t: string, id: string, s?: string, e?: string) => 
    t === 'movie' ? `https://zxcstream.xyz/player/movie/${id}/en?autoplay=false&back=true&server=0` : `https://zxcstream.xyz/player/tv/${id}/${s || 1}/${e || 1}/en?autoplay=false&back=true&server=0` },
  { name: 'Frembed', build: (t: string, id: string, s?: string, e?: string) => 
    t === 'movie' ? `https://frembed.bond/embed/movie/${id}` : `https://frembed.bond/embed/tv/${id}/${s || 1}/${e || 1}` },
  { name: 'VidBinge', build: (t: string, id: string, s?: string, e?: string) => 
    t === 'movie' ? `https://vidbinge.to/movie/${id}` : `https://vidbinge.to/tv/${id}/${s || 1}/${e || 1}` },
  { name: 'vidsrcme', build: (t: string, id: string, s?: string, e?: string) => 
    t === 'movie' ? `https://vidsrcme.ru/embed/movie?tmdb=${id}` : `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s || 1}&episode=${e || 1}` },
  { name: 'vembed', build: (t: string, id: string, s?: string, e?: string) => 
    t === 'movie' ? `https://vembed.stream/play/${id}` : `https://vembed.stream/play/${id}?s=${s || 1}&e=${e || 1}` },
  { name: 'MoviePla', build: (t: string, id: string, s?: string, e?: string) => 
    t === 'movie' ? `https://moviepla.net/embed/${id}` : `https://moviepla.net/embed/${id}?season=${s || 1}&episode=${e || 1}` },
  { name: '123Movies', build: (t: string, id: string, s?: string, e?: string) => 
    t === 'movie' ? `https://www.123movies.life/embed/${id}` : `https://www.123movies.life/embed/${id}?season=${s || 1}&episode=${e || 1}` },
]

export default function WatchPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'movie'
  const season = searchParams.get('s')
  const episode = searchParams.get('e')

  const [movie, setMovie] = useState<ContentItem | null>(null)
  const [currentProvider, setCurrentProvider] = useState(0)
  const [loading, setLoading] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedRef = useRef(false)

  const embedUrl = providers[currentProvider].build(type, params.id, season || undefined, episode || undefined)

  useEffect(() => {
    async function fetchMovie() {
      try {
        const endpoint = type === 'tv' ? `tv/${params.id}` : `movie/${params.id}`
        const res = await fetch(`/api/tmdb?endpoint=${endpoint}`)
        const data = await res.json()
        if (data.id) {
          const item: ContentItem = {
            id: String(data.id),
            title: data.title || data.name || '',
            poster: poster(data.poster_path),
            backdrop: backdrop(data.backdrop_path),
            rating: data.vote_average || 0,
            year: (data.release_date || data.first_air_date || '2024').split('-')[0],
            genre: data.genres?.map((g: any) => g.name) || [],
            type: type as 'movie' | 'tv',
            description: data.overview || '',
          }
          setMovie(item)
        }
      } catch (err) {
        console.error('Failed to fetch movie:', err)
      }
    }
    fetchMovie()
  }, [params.id, type])

  const handleIframeLoad = () => {
    if (loadedRef.current) return
    loadedRef.current = true
    setLoading(false)
    setVideoLoaded(true)
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current)
      switchTimeoutRef.current = null
    }
  }

  useEffect(() => {
    if (videoLoaded) return

    loadedRef.current = false
    setLoading(true)
    
    if (switchTimeoutRef.current) clearTimeout(switchTimeoutRef.current)
    
    switchTimeoutRef.current = setTimeout(() => {
      if (!videoLoaded && currentProvider < providers.length - 1) {
        setCurrentProvider(prev => prev + 1)
      }
    }, 10000)

    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current)
      }
    }
  }, [currentProvider, params.id, videoLoaded])

  return (
    <div className="watch-page">
      <nav className="watch-nav">
        <a href="/" className="watch-logo">VAULT<span style={{ color: '#fff' }}>SPHERE</span></a>
        <span style={{ fontSize: 12, color: videoLoaded ? '#4ade80' : '#f5c518' }}>
          {videoLoaded ? '● Playing' : '● Loading...'}
        </span>
      </nav>

      <div className="player-container">
        <div
          className="player-backdrop"
          style={movie?.backdrop ? { backgroundImage: `url(${movie.backdrop})` } : undefined}
        />
        {loading && (
          <div className="player-loading">
            <div className="spinner" />
          </div>
        )}
        <iframe 
          ref={iframeRef}
          key={`${currentProvider}-${params.id}`}
          src={embedUrl} 
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
          allow="autoplay; encrypted-media"
          onLoad={handleIframeLoad}
        />
      </div>

      <div className="provider-bar">
        <span style={{ fontSize: 11, color: '#6b7a94', marginRight: 4 }}>Sources:</span>
        {providers.map((p, i) => (
          <button 
            key={p.name} 
            className={`provider-btn ${i === currentProvider ? 'active' : ''}`}
            onClick={() => { loadedRef.current = false; setCurrentProvider(i); setVideoLoaded(false) }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="info-panel">
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 1, marginBottom: 6, color: '#fff' }}>{movie?.title || 'Loading...'}</h1>
        <p style={{ fontSize: 13, color: '#8a9bb5', marginBottom: 12 }}>
          {movie?.year} · {movie?.genre[0]} · HD
        </p>
        <p style={{ fontSize: 14, color: 'rgba(240,242,245,0.65)', maxWidth: 640, lineHeight: 1.65 }}>
          {movie?.description || 'Loading movie details...'}
        </p>
        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  )
}
