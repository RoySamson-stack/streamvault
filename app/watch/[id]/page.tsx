'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
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

interface Provider {
  name: string
  build: (type: string, id: string, season?: string, episode?: string) => string
  testUrl: string
}

const providers: Provider[] = [
  { name: 'zxcstream', build: (t, id, s, e) => t === 'movie' ? `https://zxcstream.xyz/embed/movie/${id}` : `https://zxcstream.xyz/embed/tv/${id}/${s || 1}/${e || 1}`, testUrl: 'https://zxcstream.xyz' },
  { name: 'Frembed', build: (t, id, s, e) => t === 'movie' ? `https://frembed.bond/embed/movie/${id}` : `https://frembed.bond/embed/tv/${id}/${s || 1}/${e || 1}`, testUrl: 'https://frembed.bond' },
  { name: 'VidBinge', build: (t, id, s, e) => t === 'movie' ? `https://vidbinge.to/movie/${id}` : `https://vidbinge.to/tv/${id}/${s || 1}/${e || 1}`, testUrl: 'https://vidbinge.to' },
  { name: 'VidSrc.to', build: (t, id, s, e) => t === 'movie' ? `https://vidsrc.to/embed/movie/${id}` : `https://vidsrc.to/embed/tv/${id}/${s || 1}/${e || 1}`, testUrl: 'https://vidsrc.to' },
  { name: 'vidsrcme', build: (t, id, s, e) => t === 'movie' ? `https://vidsrcme.ru/embed/movie?tmdb=${id}` : `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s || 1}&episode=${e || 1}`, testUrl: 'https://vidsrcme.ru' },
  { name: 'vembed', build: (t, id, s, e) => t === 'movie' ? `https://vembed.stream/play/${id}` : `https://vembed.stream/play/${id}?s=${s || 1}&e=${e || 1}`, testUrl: 'https://vembed.stream' },
  { name: 'MoviePla', build: (t, id, s, e) => t === 'movie' ? `https://moviepla.net/embed/${id}` : `https://moviepla.net/embed/${id}?season=${s || 1}&episode=${e || 1}`, testUrl: 'https://moviepla.net' },
  { name: '123Movies', build: (t, id, s, e) => t === 'movie' ? `https://www.123movies.life/embed/${id}` : `https://www.123movies.life/embed/${id}?season=${s || 1}&episode=${e || 1}`, testUrl: 'https://www.123movies.life' },
]

export default function WatchPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'movie'
  const season = searchParams.get('s')
  const episode = searchParams.get('e')

  const [movie, setMovie] = useState<ContentItem | null>(null)
  const [embedUrl, setEmbedUrl] = useState('')
  const [currentProvider, setCurrentProvider] = useState(0)
  const [providerStates, setProviderStates] = useState<Record<number, { status: string; latency: number | null }>>({})
  const [playing, setPlaying] = useState(false)
  const [prog, setProg] = useState(0)
  const [toastMsg, setToastMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const iframeKeyRef = useRef(0)
  const testedRef = useRef(new Set())
  const fastestSwitchedRef = useRef(false)
  const autoSwitchRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const providerIndexRef = useRef(0)

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

  const testProvider = async (index: number) => {
    if (testedRef.current.has(index)) return
    setProviderStates(prev => ({ ...prev, [index]: { status: 'testing', latency: null } }))
    try {
      const start = performance.now()
      await fetch(providers[index].testUrl, { method: 'HEAD', mode: 'no-cors' })
      const latency = Math.round(performance.now() - start)
      setProviderStates(prev => ({ ...prev, [index]: { status: 'ready', latency } }))
      testedRef.current.add(index)
    } catch {
      setProviderStates(prev => ({ ...prev, [index]: { status: 'failed', latency: null } }))
      testedRef.current.add(index)
    }
  }

  useEffect(() => {
    const url = providers[currentProvider]?.build(type, params.id, season ?? undefined, episode ?? undefined) || ''
    setEmbedUrl(url)
    iframeKeyRef.current += 1
    setLoading(true)
    providerIndexRef.current = currentProvider
    fastestSwitchedRef.current = false
    providers.forEach((_, i) => testProvider(i))

    if (autoSwitchRef.current) clearTimeout(autoSwitchRef.current)
    autoSwitchRef.current = setTimeout(() => {
      const nextProvider = (providerIndexRef.current + 1) % providers.length
      providerIndexRef.current = nextProvider
      setCurrentProvider(nextProvider)
      showToast(`Trying ${providers[nextProvider].name}...`)
    }, 8000)
  }, [params.id, type, season, episode])

  useEffect(() => {
    if (autoSwitchRef.current) clearTimeout(autoSwitchRef.current)
    autoSwitchRef.current = setTimeout(() => {
      const nextProvider = (providerIndexRef.current + 1) % providers.length
      providerIndexRef.current = nextProvider
      setCurrentProvider(nextProvider)
      showToast(`Trying ${providers[nextProvider].name}...`)
    }, 8000)
  }, [currentProvider])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2800)
  }



  const togglePlay = () => {
    setPlaying(!playing)
    if (!playing) {
      const timer = setInterval(() => {
        setProg(p => Math.min(100, p + 0.1))
      }, 200)
      setTimeout(() => clearInterval(timer), 10000)
    }
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.unsplash.com/css/all.css" rel="stylesheet" />
      
      <div style={{ background: '#07090d', minHeight: '100vh', color: '#f0f2f5', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #07090d; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #e8c96d; border-radius: 50%; animation: spin 1s linear infinite; }
          .logo { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #e8c96d; text-decoration: none; }
          .player-area { position: relative; width: 100%; aspect-ratio: 16/9; max-height: calc(100vh - 200px); background: #000; cursor: pointer; }
          .player-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(20,30,50,0.9) 0%, transparent 70%), linear-gradient(135deg,#07090d 0%,#0f1820 40%,#1a1020 70%,#07090d 100%); display: flex; align-items: center; justify-content: center; }
          .play-btn { width: 80px; height: 80px; border-radius: 50%; background: rgba(232,201,109,0.15); border: 2px solid rgba(232,201,109,0.5); display: flex; align-items: center; justify-content: center; transition: all 0.2s; backdrop-filter: blur(8px); }
          .play-btn:hover { background: rgba(232,201,109,0.3); border-color: #e8c96d; transform: scale(1.08); }
          .controls { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(0deg,rgba(0,0,0,0.92) 0%,transparent 100%); padding: 32px 32px 20px; opacity: 0; transition: opacity 0.2s; }
          .player-area:hover .controls { opacity: 1; }
          .progress-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.15); border-radius: 2px; margin-bottom: 14px; }
          .progress-fill { height: 100%; border-radius: 2px; background: #e8c96d; }
          .ctrl-row { display: flex; align-items: center; gap: 12px; }
          .ctrl-btn { background: none; border: none; color: rgba(255,255,255,0.85); padding: 6px; border-radius: 4px; cursor: pointer; transition: color 0.2s; }
          .ctrl-btn:hover { color: #fff; }
          .ctrl-btn svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.8; }
          .time-disp { font-size: 12px; color: rgba(255,255,255,0.7); }
          .quality-btn { font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); border-radius: 3px; padding: 4px 8px; color: rgba(255,255,255,0.75); cursor: pointer; }
          .info-panel { padding: 28px 48px 32px; border-top: 1px solid rgba(255,255,255,0.06); }
          .provider-btn { padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 8px; }
          .provider-btn.active { border-color: #e8c96d; background: rgba(232,201,109,0.15); }
          .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(80px); background: #0d1117; border: 1px solid rgba(232,201,109,0.3); border-radius: 6px; padding: 12px 22px; font-size: 13px; color: #e8c96d; box-shadow: 0 12px 40px rgba(0,0,0,0.5); transition: transform 0.35s, opacity 0.3s; opacity: 0; z-index: 1000; }
          .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
        `}</style>

        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/" className="logo">VAULT<span style={{ color: '#fff' }}>SPHERE</span></a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {Object.values(providerStates).filter(s => s?.status === 'ready').length > 0 && (
              <span style={{ fontSize: 12, color: '#4ade80' }}>● {Object.values(providerStates).filter(s => s?.status === 'ready').length} sources ready</span>
            )}
          </div>
        </nav>

        <div className="player-area" onClick={() => { setPlaying(true); setLoading(true) }}>
          <div className="player-bg">
            {movie?.backdrop && <img src={movie.backdrop} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />}
          </div>
          {!playing && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 10 }}>
              {loading ? (
                <div className="spinner" />
              ) : (
                <div className="play-btn">
                  <svg viewBox="0 0 24 24" style={{ width: 30, height: 30, fill: '#e8c96d', marginLeft: 4 }}><path d="M5 3l14 9-14 9V3z"/></svg>
                </div>
              )}
              <span style={{ fontSize: 13, color: 'rgba(240,242,245,0.7)', textTransform: 'uppercase', letterSpacing: 1 }}>{loading ? 'Loading...' : 'Press to Play'}</span>
            </div>
          )}
          <div className="controls">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${prog}%` }}></div></div>
            <div className="ctrl-row">
              <button className="ctrl-btn" onClick={(e) => { e.stopPropagation(); setPlaying(!playing) }}>
                <svg viewBox="0 0 24 24">{playing ? <><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></> : <path d="M5 3l14 9-14 9V3z"/>}</svg>
              </button>
              <button className="ctrl-btn" title="Previous"><svg viewBox="0 0 24 24"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg></button>
              <button className="ctrl-btn" title="Next"><svg viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg></button>
              <span className="time-disp">{Math.floor(prog * 1.58)}:{String(Math.floor((prog * 94) % 60)).padStart(2, '0')} / {movie?.title ? 'HD' : '...'}</span>
              <div style={{ flex: 1 }}></div>
              <span className="quality-btn">1080p</span>
              <button className="ctrl-btn"><svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
            </div>
          </div>
        </div>

        <div className="info-panel">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40 }}>
            <div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 1, marginBottom: 6, color: '#fff' }}>{movie?.title || 'Loading...'}</h1>
              <p style={{ fontSize: 13, color: '#8a9bb5', marginBottom: 12 }}>{movie?.year} · {movie?.genre[0]} · HD</p>
              <p style={{ fontSize: 14, color: 'rgba(240,242,245,0.65)', maxWidth: 640, lineHeight: 1.65 }}>{movie?.description || 'Loading movie details...'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: 18 }} onClick={() => showToast('Added to Watchlist ✓')}>♥</button>
                <button style={{ width: 44, height: 44, borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', fontSize: 18 }} onClick={() => showToast('Link copied! ✓')}>⤵</button>
              </div>
              <a href="/" style={{ fontSize: 11, color: '#8a9bb5', textDecoration: 'none' }}>← Back to Home</a>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 48px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, color: '#6b7a94', marginBottom: 16, fontWeight: 600 }}>Streaming Sources</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {providers.map((p, i) => (
              <button key={p.name} className={`provider-btn ${i === currentProvider ? 'active' : ''}`} onClick={() => { setCurrentProvider(i); iframeKeyRef.current += 1; setLoading(true) }}>
                <span>{p.name}</span>
                {providerStates[i]?.status === 'ready' && <span style={{ fontSize: 10, color: '#4ade80' }}>✓</span>}
                {providerStates[i]?.status === 'testing' && <span style={{ fontSize: 10, color: '#f5c518' }}>⚡</span>}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 20, borderRadius: 8, overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.06)' }}>
            <iframe key={iframeKeyRef.current} ref={iframeRef} src={embedUrl} style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen onLoad={() => setLoading(false)} />
          </div>
        </div>

        <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </>
  )
}
