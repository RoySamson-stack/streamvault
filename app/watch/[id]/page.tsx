'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WatchPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'movie'
  const season = searchParams.get('s')
  const episode = searchParams.get('e')
  const [embedUrl, setEmbedUrl] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    // Build embed URL based on type
    let url = ''
    if (type === 'movie') {
      url = `https://vidsrc.to/embed/movie/${params.id}`
    } else {
      url = `https://vidsrc.to/embed/tv/${params.id}/${season || 1}/${episode || 1}`
    }
    setEmbedUrl(url)
  }, [params.id, type, season, episode])

  const handleError = () => {
    setError(true)
  }

  if (error) {
    // Fallback to alternative embed
    const fallbackUrl = type === 'movie'
      ? `https://vidsrc.me/embed/movie?tmdb=${params.id}`
      : `https://vidsrc.me/embed/tv?tmdb=${params.id}&season=${season || 1}&episode=${episode || 1}`

    return (
      <div style={{ 
        background: '#000', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px'
      }}>
        <iframe
          src={fallbackUrl}
          width="100%"
          style={{ aspectRatio: '16/9', maxWidth: 1280, border: 'none' }}
          allowFullScreen
          allow="fullscreen"
        />
      </div>
    )
  }

  return (
    <div style={{ 
      background: '#000', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      {embedUrl && (
        <iframe
          src={embedUrl}
          width="100%"
          style={{ aspectRatio: '16/9', maxWidth: 1280, border: 'none' }}
          allowFullScreen
          allow="fullscreen"
          onError={handleError}
        />
      )}
    </div>
  )
}
