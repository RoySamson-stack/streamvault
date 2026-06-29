'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import TopNav from '../components/TopNav'
import Hls from 'hls.js'

type Channel = {
  id: string
  name: string
  stream_url: string
  status: string
  logo?: string
  group?: string
  players: { name: string; path: string; target_host: string; available: boolean }[]
  daddy_endpoint?: string
}

type ScheduleEvent = {
  category: string
  date: string
  time: string
  title: string
  channels: { id: string; name: string }[]
  start_unix?: number
}

export default function SportsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [playerChannel, setPlayerChannel] = useState<Channel | null>(null)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [streamLoading, setStreamLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  // Fetch data
  useEffect(() => {
    async function load() {
      try {
        const [schedRes, chanRes] = await Promise.all([
          fetch('/api/live/schedule'),
          fetch('/api/live/channels'),
        ])
        const schedData = await schedRes.json()
        const chanData = await chanRes.json()
        setEvents(schedData.events || [])
        setChannels(chanData.channels || [])
      } catch (err) {
        console.error('Failed to load live data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  const stopPlayback = useCallback(() => {
    destroyHls()
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.removeAttribute('src')
      videoRef.current.load()
    }
    setIsPlaying(false)
    setPlayerChannel(null)
    setPlayerError(null)
    setStreamLoading(false)
    retryCountRef.current = 0
  }, [destroyHls])

  // Build a stream URL for a given channel + player index
  const getStreamUrl = useCallback((ch: Channel, index: number): string => {
    // First try: use the channel's direct stream_url (for index 0)
    if (index === 0 && ch.stream_url) return ch.stream_url
    // Fallback: build from player data using target_host
    const available = ch.players?.filter(p => p.available) || []
    const player = available[index] || available[0]
    if (!player) return ch.stream_url || ''
    return `https://${player.target_host}/${player.path}/stream-${ch.id}.php`
  }, [])

  // Start HLS playback
  const startStream = useCallback((url: string) => {
    const video = videoRef.current
    if (!video || !url) {
      setPlayerError('No stream URL available')
      setStreamLoading(false)
      return
    }

    destroyHls()
    setStreamLoading(true)
    setPlayerError(null)

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
      video.addEventListener('loadedmetadata', () => {
        setStreamLoading(false)
        video.play().catch(() => {})
      }, { once: true })
      video.addEventListener('error', () => {
        setStreamLoading(false)
        setPlayerError('Stream failed to load')
      }, { once: true })
      return
    }

    if (!Hls.isSupported()) {
      setPlayerError('HLS not supported in this browser')
      setStreamLoading(false)
      return
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      maxBufferLength: 15,
      maxMaxBufferLength: 30,
      maxBufferHole: 0.5,
      fragLoadingTimeOut: 8000,
      manifestLoadingTimeOut: 8000,
      levelLoadingTimeOut: 8000,
    })
    hlsRef.current = hls
    hls.loadSource(url)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setStreamLoading(false)
      retryCountRef.current = 0
      video.play().catch(() => {})
    })

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (!data.fatal) return

      hls.destroy()
      hlsRef.current = null
      setStreamLoading(false)

      // Auto-retry with next source
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        autoSwitchSource()
      } else {
        setPlayerError('All sources failed. Try again later.')
      }
    })
  }, [destroyHls])

  // Auto-switch to next source on failure
  const autoSwitchSource = useCallback(() => {
    if (!playerChannel) return
    const available = playerChannel.players?.filter(p => p.available) || []
    const totalSources = Math.max(available.length, 1)
    const next = (playerIndex + 1) % totalSources
    setPlayerIndex(next)
    const url = getStreamUrl(playerChannel, next)
    startStream(url)
  }, [playerChannel, playerIndex, getStreamUrl, startStream])

  // Manual source switch
  const switchToSource = useCallback((index: number) => {
    if (!playerChannel) return
    retryCountRef.current = 0
    setPlayerIndex(index)
    const url = getStreamUrl(playerChannel, index)
    startStream(url)
  }, [playerChannel, getStreamUrl, startStream])

  // Start playback when channel is set
  useEffect(() => {
    if (!isPlaying || !playerChannel || !videoRef.current) return
    const url = getStreamUrl(playerChannel, playerIndex)
    startStream(url)
  }, [isPlaying, playerChannel]) // eslint-disable-line react-hooks/exhaustive-deps

  const playChannel = useCallback((ch: Channel) => {
    destroyHls()
    retryCountRef.current = 0
    setPlayerChannel(ch)
    setPlayerIndex(0)
    setPlayerError(null)
    setStreamLoading(true)
    setIsPlaying(true)
  }, [destroyHls])

  const selectEvent = useCallback((e: ScheduleEvent) => {
    stopPlayback()
    setSelectedEvent(e)
    const ids = e.channels.filter(c => c.id !== '00').map(c => c.id)
    // Try to find a matching channel with 'ok' status
    let found = channels.find(c => ids.includes(c.id) && c.status === 'ok')
    // Fallback: try any matching channel regardless of status
    if (!found) found = channels.find(c => ids.includes(c.id))
    if (found) {
      // Use setTimeout to avoid state race between stop and play
      setTimeout(() => playChannel(found!), 50)
    }
  }, [channels, stopPlayback, playChannel])

  const categories = useMemo(() => {
    const set = new Set(events.map(e => e.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [events])

  const filtered = useMemo(() => {
    if (categoryFilter === 'All') return events
    return events.filter(e => e.category === categoryFilter)
  }, [events, categoryFilter])

  const worldCupEvents = useMemo(() =>
    events.filter(e =>
      e.category?.includes('FIFA World Cup') ||
      e.title?.toLowerCase().includes('fifa world cup')
    ), [events])

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300;1,9..40,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />

      <TopNav active="sports" />

      <div className="sports-hero">
        <h1>Live <span>Sports</span></h1>
        <p>Today&apos;s live games & events — powered by live channels.</p>
      </div>

      {!loading && worldCupEvents.length > 0 && (
        <div className="wc-banner">
          <div className="wc-banner-icon">🏆</div>
          <div className="wc-banner-text">
            <h2>FIFA World Cup 2026</h2>
            <p>{worldCupEvents.length} match{worldCupEvents.length > 1 ? 'es' : ''} today</p>
          </div>
        </div>
      )}

      <div className="sports-layout">
        <div className="sports-list">
          <div className="sports-filter-row">
            {categories.slice(0, 20).map(c => (
              <button
                key={c}
                className={`filter-chip ${categoryFilter === c ? 'active' : ''}`}
                onClick={() => { setCategoryFilter(c); setSelectedEvent(null); stopPlayback() }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="sports-list-scroll">
            {loading && <div className="sports-empty"><div className="spinner" style={{ width: 20, height: 20 }} /> Loading live schedule…</div>}
            {!loading && filtered.length === 0 && (
              <div className="sports-empty">No events in this category right now.</div>
            )}
            {filtered.map((e, i) => (
              <button
                key={`${e.date}-${e.time}-${e.title}-${i}`}
                className={`sports-list-item ${selectedEvent === e ? 'active' : ''}`}
                onClick={() => selectEvent(e)}
              >
                <div className="sports-list-time">{e.time}</div>
                <div className="sports-list-info">
                  <div className="sports-list-title">{e.title}</div>
                  <div className="sports-list-sub">
                    {e.channels.filter(c => c.id !== '00').map(c => c.name).join(', ') || e.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="sports-player">
          {playerChannel && isPlaying ? (
            <>
              <div className="sports-player-top">
                <div>
                  <div className="sports-player-title">{selectedEvent?.title || playerChannel.name}</div>
                  <div className="sports-player-sub">{selectedEvent?.category} · {playerChannel.name}</div>
                </div>
                <button className="btn btn-outline" onClick={stopPlayback}>Stop ✕</button>
              </div>
              <div className="sports-iframe-wrap">
                {streamLoading && (
                  <div className="sports-stream-loading">
                    <div className="spinner" />
                    <span>Connecting to stream…</span>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="sports-video"
                  controls
                  autoPlay
                  playsInline
                />
              </div>
              {playerError && (
                <div className="sports-error">
                  <p>{playerError}</p>
                  <button className="btn btn-outline" onClick={() => { retryCountRef.current = 0; switchToSource(0) }} style={{ marginTop: 8 }}>
                    Retry from Source 1
                  </button>
                </div>
              )}
              {playerChannel.players?.filter(p => p.available).length > 1 && (
                <div className="sports-sources">
                  <span>Sources:</span>
                  {playerChannel.players.filter(p => p.available).map((_, i) => (
                    <button
                      key={i}
                      className={`provider-btn ${i === playerIndex ? 'active' : ''}`}
                      onClick={() => switchToSource(i)}
                    >
                      P{i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="sports-player-top">
                <div>
                  <div className="sports-player-title">
                    {selectedEvent?.title || 'Select an event'}
                  </div>
                  <div className="sports-player-sub">
                    {selectedEvent?.category || 'Choose a game from the list'}
                  </div>
                </div>
              </div>
              <div className="sports-iframe-wrap">
                {selectedEvent ? (
                  <div className="sports-no-embed">
                    <div className="sports-no-embed-title">🎥 Click to start watching</div>
                    <div className="sports-no-embed-sub">
                      {selectedEvent.channels.filter(c => c.id !== '00').map(c => c.name).join(', ') || 'Live stream ready'}
                    </div>
                    {selectedEvent.channels.some(c => c.id !== '00') ? (
                      <button
                        className="btn btn-gold"
                        style={{ marginTop: 16 }}
                        onClick={() => selectEvent(selectedEvent)}
                      >
                        ▶ Watch Now
                      </button>
                    ) : (
                      <div className="sports-no-embed-sub" style={{ marginTop: 12, color: 'var(--muted2)' }}>
                        No dedicated channel for this event yet.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="sports-no-embed">
                    <div className="sports-no-embed-title">🏟️ Live Sports</div>
                    <div className="sports-no-embed-sub">Select an event from the schedule to start watching.</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .wc-banner {
          display: flex; align-items: center; gap: 16px;
          max-width: 1200px; margin: 0 auto 16px; padding: 16px 24px;
          background: linear-gradient(135deg, #1a2a1f 0%, #0d1a14 100%);
          border: 1px solid rgba(232,201,109,0.2); border-radius: 12px;
        }
        .wc-banner-icon { font-size: 36px; }
        .wc-banner-text h2 { font-size: 18px; font-weight: 700; margin: 0; color: var(--accent); }
        .wc-banner-text p { font-size: 13px; color: var(--muted2); margin: 2px 0 0; }
        .sports-list-time {
          font-size: 12px; font-family: ui-monospace, monospace;
          color: var(--accent); min-width: 48px; flex-shrink: 0;
        }
        .sports-list-info { flex: 1; min-width: 0; }
        .sports-video { width: 100%; height: 100%; object-fit: contain; background: #000; }
        .sports-stream-loading {
          position: absolute; inset: 0; z-index: 5;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; background: rgba(0,0,0,0.85);
          color: var(--muted); font-size: 13px;
          animation: fadeIn 0.2s ease;
        }
        .sports-error {
          padding: 12px 16px; background: rgba(255,60,60,0.1);
          border-top: 1px solid rgba(255,60,60,0.2); text-align: center;
          animation: fadeIn 0.2s ease;
        }
        .sports-error p { font-size: 12px; color: #f77; margin: 0; }
        .sports-sources {
          display: flex; gap: 6px; padding: 8px 14px;
          border-top: 1px solid var(--border); align-items: center;
          background: #161618; flex-wrap: wrap;
        }
        .sports-sources span { font-size: 11px; color: #6b7a94; margin-right: 4px; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  )
}
