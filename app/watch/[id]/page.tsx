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
    t === 'movie' ? `https://zxcstream.xyz/embed/movie/${id}` : `https://zxcstream.xyz/embed/tv/${id}/${s || 1}/${e || 1}` },
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
  }, [currentProvider, params.id])

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div style={{ background: '#07090d', minHeight: '100vh', color: '#f0f2f5', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #07090d; }
          .logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #e8c96d; text-decoration: none; }
          .player-container { position: relative; width: 100%; aspect-ratio: 16/9; background: #000; }
          .player-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #000; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #e8c96d; border-radius: 50%; animation: spin 1s linear infinite; }
          .provider-bar { padding: 12px 48px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
          .provider-btn { padding: 6px 12px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px; transition: all 0.2s; }
          .provider-btn.active { border-color: #e8c96d; background: rgba(232,201,109,0.15); color: #e8c96d; }
          .provider-btn:hover:not(.active) { border-color: rgba(255,255,255,0.3); color: #fff; }
          .info-panel { padding: 28px 48px 32px; border-top: 1px solid rgba(255,255,255,0.06); }
          .back-link { font-size: 11px; color: #8a9bb5; text-decoration: none; display: inline-block; margin-top: 12px; }
          .back-link:hover { color: #e8c96d; }
        `}</style>

        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" className="logo">VAULT<span style={{ color: '#fff' }}>SPHERE</span></a>
          <span style={{ fontSize: 12, color: videoLoaded ? '#4ade80' : '#f5c518' }}>
            {videoLoaded ? '● Playing' : '● Loading...'}
          </span>
        </nav>

        <div className="player-container">
          {loading && (
            <div className="player-loading">
              <div className="spinner" />
            </div>
          )}
          <iframe 
            ref={iframeRef}
            key={`${currentProvider}-${params.id}`}
            src={embedUrl} 
            style={{ width: '100%', height: '100%', border: 'none', display: loading ? 'none' : 'block' }}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media"
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
    </>
  )
}
