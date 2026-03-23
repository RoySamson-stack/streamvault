'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
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

export default function WatchPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'movie'
  const season = searchParams.get('s')
  const episode = searchParams.get('e')

  const [movie, setMovie] = useState<ContentItem | null>(null)
  
  const embedUrl = type === 'movie' 
    ? `https://zxcstream.xyz/embed/movie/${params.id}`
    : `https://zxcstream.xyz/embed/tv/${params.id}/${season || 1}/${episode || 1}`

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

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div style={{ background: '#07090d', minHeight: '100vh', color: '#f0f2f5', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #07090d; }
          .logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #e8c96d; text-decoration: none; }
          .player-container { width: 100%; aspect-ratio: 16/9; background: #000; }
          .info-panel { padding: 28px 48px 32px; border-top: 1px solid rgba(255,255,255,0.06); }
          .back-link { font-size: 11px; color: #8a9bb5; text-decoration: none; display: inline-block; margin-top: 12px; }
          .back-link:hover { color: #e8c96d; }
        `}</style>

        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" className="logo">VAULT<span style={{ color: '#fff' }}>SPHERE</span></a>
        </nav>

        <div className="player-container">
          <iframe 
            src={embedUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media"
          />
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
