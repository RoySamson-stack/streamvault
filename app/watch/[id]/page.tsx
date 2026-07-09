 'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useRef } from 'react'
import { poster, backdrop } from '@/lib/tmdb'
import TopNav from '../../components/TopNav'

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

interface SeasonSummary {
  id: number
  name: string
  season_number: number
  episode_count: number
  air_date?: string | null
  overview?: string | null
  poster_path?: string | null
}

interface SeasonEpisode {
  id: number
  episode_number: number
  name: string
  overview: string | null
  air_date?: string | null
  runtime?: number | null
  still_path?: string | null
}

interface SeasonDetail {
  id: number
  name: string
  season_number: number
  overview?: string | null
  poster_path?: string | null
  episodes: SeasonEpisode[]
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

const formatAirDate = (value?: string | null) => {
  if (!value) return 'Air date TBA'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'movie'
  const router = useRouter()
  const season = searchParams.get('s')
  const episode = searchParams.get('e')

  const [movie, setMovie] = useState<ContentItem | null>(null)
  const [currentProvider, setCurrentProvider] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vaultsphere_fastest_provider')
      if (saved) {
        const idx = providers.findIndex(p => p.name === saved)
        if (idx !== -1) return idx
      }
    }
    return 0
  })

  const saveProviderPreference = (i: number) => {
    try { localStorage.setItem('vaultsphere_fastest_provider', providers[i].name) } catch {}
  }
  const [loading, setLoading] = useState(true)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const switchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedRef = useRef(false)

  const searchParamsString = searchParams.toString()
  const parsedSeason = Number.isFinite(Number(season)) && Number(season) >= 1 ? Number(season) : 1
  const parsedEpisode = Number.isFinite(Number(episode)) && Number(episode) >= 1 ? Number(episode) : 1

  // Restore last watched season/episode if not specified in URL
  const getInitialSeason = () => {
    if (season) return parsedSeason
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`vaultsphere_progress_${params.id}`)
      if (saved) {
        try { const p = JSON.parse(saved); if (p.season >= 1) return p.season } catch {}
      }
    }
    return 1
  }
  const getInitialEpisode = () => {
    if (episode) return parsedEpisode
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`vaultsphere_progress_${params.id}`)
      if (saved) {
        try { const p = JSON.parse(saved); if (p.episode >= 1) return p.episode } catch {}
      }
    }
    return 1
  }

  const [selectedSeason, setSelectedSeason] = useState(getInitialSeason)
  const [selectedEpisode, setSelectedEpisode] = useState(getInitialEpisode)
  const [seasonList, setSeasonList] = useState<SeasonSummary[]>([])
  const [seasonDetail, setSeasonDetail] = useState<SeasonDetail | null>(null)
  const [seasonsLoading, setSeasonsLoading] = useState(false)
  const [seasonDetailLoading, setSeasonDetailLoading] = useState(false)
  const [seasonError, setSeasonError] = useState<string | null>(null)
  const [seasonDetailError, setSeasonDetailError] = useState<string | null>(null)
  const isTV = type === 'tv'

  const updateQueryParams = useCallback((seasonNumber: number, episodeNumber: number) => {
    if (!isTV) return
    const nextParams = new URLSearchParams(searchParamsString)
    nextParams.set('type', type)
    nextParams.set('s', String(seasonNumber))
    nextParams.set('e', String(episodeNumber))
    router.replace(`/watch/${params.id}?${nextParams.toString()}`, { scroll: false })
    // Save progress to localStorage
    try {
      localStorage.setItem(`vaultsphere_progress_${params.id}`, JSON.stringify({
        season: seasonNumber,
        episode: episodeNumber,
        type,
        updatedAt: Date.now(),
      }))
    } catch {}
  }, [isTV, router, searchParamsString, type, params.id])

  const handleSeasonSelect = useCallback((seasonNumber: number) => {
    if (!isTV || seasonNumber === selectedSeason) return
    setSelectedSeason(seasonNumber)
    setSelectedEpisode(1)
    updateQueryParams(seasonNumber, 1)
  }, [isTV, selectedSeason, updateQueryParams])

  const handleEpisodeSelect = useCallback((episodeNumber: number) => {
    if (!isTV || episodeNumber === selectedEpisode) return
    setSelectedEpisode(episodeNumber)
    updateQueryParams(selectedSeason, episodeNumber)
    if (!hasStarted) setHasStarted(true)
  }, [isTV, selectedEpisode, selectedSeason, updateQueryParams, hasStarted])

  const embedUrl = providers[currentProvider].build(
    type,
    params.id,
    isTV ? String(selectedSeason) : undefined,
    isTV ? String(selectedEpisode) : undefined,
  )

  useEffect(() => {
    if (!isTV) return
    loadedRef.current = false
    setVideoLoaded(false)
    setLoading(true)
  }, [embedUrl, isTV])

  useEffect(() => {
    if (!isTV) return
    const paramsSnapshot = new URLSearchParams(searchParamsString)
    const urlSeason = Number(paramsSnapshot.get('s'))
    const urlEpisode = Number(paramsSnapshot.get('e'))
    if (Number.isFinite(urlSeason) && urlSeason >= 1 && urlSeason !== selectedSeason) {
      setSelectedSeason(urlSeason)
    }
    if (Number.isFinite(urlEpisode) && urlEpisode >= 1 && urlEpisode !== selectedEpisode) {
      setSelectedEpisode(urlEpisode)
    }
  }, [isTV, searchParamsString, selectedSeason, selectedEpisode])

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

  useEffect(() => {
    if (!isTV) {
      setSeasonList([])
      setSeasonDetail(null)
      setSeasonError(null)
      setSeasonDetailError(null)
      setSeasonsLoading(false)
      return
    }

    let canceled = false
    setSeasonsLoading(true)
    setSeasonError(null)

    fetch(`/api/tmdb?endpoint=tv/${params.id}&append_to_response=seasons`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const data = await res.json()
        if (canceled) return
        const seasons: SeasonSummary[] = (data.seasons || []).filter((season: SeasonSummary) => season.season_number > 0)
        setSeasonList(seasons)

        if (seasons.length === 0) {
          setSeasonError('No seasons found for this show.')
          setSeasonDetail(null)
          return
        }

        const hasSelected = seasons.some(s => s.season_number === selectedSeason)
        if (!hasSelected) {
          handleSeasonSelect(seasons[0].season_number)
        }
      })
      .catch((err) => {
        if (canceled) return
        console.error('Failed to load seasons:', err)
        setSeasonError('Unable to load seasons right now.')
      })
      .finally(() => {
        if (!canceled) setSeasonsLoading(false)
      })

    return () => { canceled = true }
  }, [isTV, params.id, selectedSeason, handleSeasonSelect])

  useEffect(() => {
    if (!isTV) return
    setSeasonDetail(null)
    setSeasonDetailError(null)
    setSeasonDetailLoading(true)
    let canceled = false

    fetch(`/api/tmdb?endpoint=tv/${params.id}/season/${selectedSeason}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const detail: SeasonDetail = await res.json()
        if (canceled) return
        setSeasonDetail({
          ...detail,
          episodes: (detail.episodes || []).slice().sort((a, b) => a.episode_number - b.episode_number),
        })
      })
      .catch((err) => {
        if (canceled) return
        console.error('Failed to load season detail:', err)
        setSeasonDetailError('Unable to load episodes right now.')
      })
      .finally(() => {
        if (!canceled) setSeasonDetailLoading(false)
      })

    return () => { canceled = true }
  }, [isTV, params.id, selectedSeason])

  useEffect(() => {
    if (!seasonDetail || seasonDetail.episodes.length === 0) return
    const hasEpisode = seasonDetail.episodes.some((ep) => ep.episode_number === selectedEpisode)
    if (hasEpisode) return
    const firstEpisode = seasonDetail.episodes[0].episode_number
    if (firstEpisode) {
      setSelectedEpisode(firstEpisode)
      updateQueryParams(selectedSeason, firstEpisode)
    }
  }, [seasonDetail, selectedEpisode, selectedSeason, updateQueryParams])

  const startPlaying = (providerIdx?: number) => {
    if (providerIdx !== undefined) {
      setCurrentProvider(providerIdx)
      saveProviderPreference(providerIdx)
    }
    loadedRef.current = false
    setVideoLoaded(false)
    setHasStarted(true)
    // Save current position on play start
    if (isTV) {
      try {
        localStorage.setItem(`vaultsphere_progress_${params.id}`, JSON.stringify({
          season: selectedSeason,
          episode: selectedEpisode,
          type,
          updatedAt: Date.now(),
        }))
      } catch {}
    }
  }

  return (
    <div className="watch-page">
      <TopNav />
      <div className="watch-status">
        <span className={`watch-status-pill ${videoLoaded ? 'ok' : hasStarted ? 'warn' : ''}`}>
          {videoLoaded ? '● Playing' : hasStarted ? '● Loading...' : '● Ready'}
        </span>
      </div>

      <div className="player-container">
        <div
          className="player-backdrop"
          style={movie?.backdrop ? { backgroundImage: `url(${movie.backdrop})` } : undefined}
        />
        {!hasStarted ? (
          <div className="player-preplay">
            <div className="preplay-info">
              <h2 className="preplay-title">{movie?.title || 'Loading...'}</h2>
              <p className="preplay-meta">
                {movie?.year} · {movie?.genre?.slice(0, 2).join(', ')} · HD
              </p>
              {movie?.description && (
                <p className="preplay-desc">{movie.description.slice(0, 150)}{movie.description.length > 150 ? '…' : ''}</p>
              )}
              <div className="preplay-actions">
                <button className="preplay-play-btn" onClick={() => startPlaying()}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                  Play
                </button>
                <div className="preplay-server-dropdown">
                  <button className="preplay-server-toggle">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                    {providers[currentProvider].name}
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                  </button>
                  <div className="preplay-server-menu">
                    {providers.map((p, i) => (
                      <button
                        key={p.name}
                        className={`preplay-server-item ${i === currentProvider ? 'active' : ''}`}
                        onClick={() => startPlaying(i)}
                      >
                        <span className="preplay-server-dot" />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="player-loading">
                <div className="spinner" />
              </div>
            )}
            <iframe 
              ref={iframeRef}
              key={`${currentProvider}-${params.id}-${selectedSeason}-${selectedEpisode}`}
              src={embedUrl} 
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
              allow="autoplay; encrypted-media"
              sandbox="allow-scripts allow-same-origin allow-forms"
              referrerPolicy="no-referrer"
              onLoad={handleIframeLoad}
            />
          </>
        )}
      </div>

      {hasStarted && (
        <div className="provider-bar">
          <span style={{ fontSize: 11, color: '#6b7a94', marginRight: 4 }}>Sources:</span>
          {providers.map((p, i) => (
            <button 
              key={p.name} 
              className={`provider-btn ${i === currentProvider ? 'active' : ''}`}
              onClick={() => { loadedRef.current = false; setCurrentProvider(i); setVideoLoaded(false); saveProviderPreference(i) }}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {isTV && (
        <div className="season-panel">
          <div className="season-column">
            <div className="season-label-row">
              <span className="season-label-title">Seasons</span>
              {seasonList.length > 0 && (
                <span className="season-label-status">S{selectedSeason} · {seasonDetail?.episodes.length ?? 0} eps</span>
              )}
            </div>
            {seasonsLoading ? (
              <p className="season-helper">Loading seasons…</p>
            ) : seasonError ? (
              <p className="season-helper">{seasonError}</p>
            ) : seasonList.length === 0 ? (
              <p className="season-helper">No seasons are available yet.</p>
            ) : (
              <div className="season-list">
                {seasonList.map((seasonItem) => (
                  <button
                    key={`${seasonItem.id}-${seasonItem.season_number}`}
                    type="button"
                    className={`season-chip ${seasonItem.season_number === selectedSeason ? 'active' : ''}`}
                    onClick={() => handleSeasonSelect(seasonItem.season_number)}
                  >
                    <span>{seasonItem.name || `Season ${seasonItem.season_number}`}</span>
                    <small>{seasonItem.episode_count ?? 0} eps</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="episode-column">
            <div className="season-label-row">
              <span className="season-label-title">Episodes</span>
              {seasonDetail && seasonDetail.episodes.length > 0 && (
                <span className="season-label-status">S{selectedSeason} · E{selectedEpisode}</span>
              )}
            </div>
            {seasonDetailLoading ? (
              <p className="season-helper">Loading episodes…</p>
            ) : seasonDetailError ? (
              <p className="season-helper">{seasonDetailError}</p>
            ) : !seasonDetail || seasonDetail.episodes.length === 0 ? (
              <p className="season-helper">No episodes found for this season.</p>
            ) : (
              <div className="episode-list">
                {seasonDetail.episodes.map((ep) => (
                  <button
                    key={ep.id ?? `${selectedSeason}-${ep.episode_number}`}
                    type="button"
                    className={`episode-card ${ep.episode_number === selectedEpisode ? 'active' : ''}`}
                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                  >
                    <div>
                      <div className="episode-title">
                        Episode {ep.episode_number}{ep.name ? ` · ${ep.name}` : ''}
                      </div>
                      <div className="episode-meta">
                        {formatAirDate(ep.air_date)}
                        {ep.runtime ? ` · ${ep.runtime}m` : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
