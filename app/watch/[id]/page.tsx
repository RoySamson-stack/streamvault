'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'

interface Provider {
  name: string
  build: (type: string, id: string, season?: string, episode?: string) => string
  testUrl: string
}

const providers: Provider[] = [
  {
    name: 'VidBinge',
    build: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidbinge.to/movie/${id}`
        : `https://vidbinge.to/tv/${id}/${s || 1}/${e || 1}`,
    testUrl: 'https://vidbinge.to',
  },
  {
    name: 'VidSrc.to',
    build: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s || 1}/${e || 1}`,
    testUrl: 'https://vidsrc.to',
  },
  {
    name: 'CinePlex',
    build: (t, id, s, e) =>
      t === 'movie'
        ? `https://vidsrcme.ru/embed/movie?tmdb=${id}`
        : `https://vidsrcme.ru/embed/tv?tmdb=${id}&season=${s || 1}&episode=${e || 1}`,
    testUrl: 'https://vidsrcme.ru',
  },
  {
    name: 'StreamHub',
    build: (t, id, s, e) =>
      t === 'movie'
        ? `https://vembed.stream/play/${id}`
        : `https://vembed.stream/play/${id}?s=${s || 1}&e=${e || 1}`,
    testUrl: 'https://vembed.stream',
  },
  {
    name: '2Embed',
    build: (t, id, s, e) =>
      t === 'movie'
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embed/${id}?season=${s || 1}&episode=${e || 1}`,
    testUrl: 'https://www.2embed.cc',
  },
]

type ProviderStatus = 'idle' | 'testing' | 'ready' | 'failed'

interface ProviderState {
  status: ProviderStatus
  latency: number | null
}

export default function WatchPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'movie'
  const season = searchParams.get('s')
  const episode = searchParams.get('e')

  const [embedUrl, setEmbedUrl] = useState('')
  const [currentProvider, setCurrentProvider] = useState(0)
  const [autoMode, setAutoMode] = useState(true)
  const [providerStates, setProviderStates] = useState<Record<number, ProviderState>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadTime, setLoadTime] = useState<number | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const startTimeRef = useRef<number>(0)
  const testedRef = useRef<Set<number>>(new Set())

  const testProvider = async (index: number) => {
    if (testedRef.current.has(index) && providerStates[index]?.status !== 'idle') return

    setProviderStates(prev => ({
      ...prev,
      [index]: { status: 'testing', latency: null }
    }))

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const start = performance.now()
      await fetch(providers[index].testUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      })
      clearTimeout(timeout)

      const latency = Math.round(performance.now() - start)
      setProviderStates(prev => ({
        ...prev,
        [index]: { status: 'ready', latency }
      }))
      testedRef.current.add(index)
    } catch {
      setProviderStates(prev => ({
        ...prev,
        [index]: { status: 'failed', latency: null }
      }))
      testedRef.current.add(index)
    }
  }

  const testAllProviders = () => {
    providers.forEach((_, i) => {
      setProviderStates(prev => ({ ...prev, [i]: { status: 'idle', latency: null } }))
      testedRef.current.clear()
    })
    providers.forEach((_, i) => testProvider(i))
  }

  const selectFastest = () => {
    const readyProviders = providers
      .map((_, i) => ({ index: i, state: providerStates[i] }))
      .filter(p => p.state?.status === 'ready' && p.state.latency !== null)
      .sort((a, b) => (a.state.latency || 999) - (b.state.latency || 999))

    if (readyProviders.length > 0) {
      setCurrentProvider(readyProviders[0].index)
      setAutoMode(false)
    }
  }

  const selectProvider = (index: number) => {
    setCurrentProvider(index)
    setAutoMode(false)
    setIsLoading(true)
    setLoadTime(null)
  }

  useEffect(() => {
    const url = providers[currentProvider]?.build(type, params.id, season ?? undefined, episode ?? undefined) || ''
    setEmbedUrl(url)
    if (autoMode && Object.keys(providerStates).length > 0) {
      selectFastest()
    }
  }, [params.id, type, season, episode, currentProvider])

  useEffect(() => {
    if (autoMode && Object.values(providerStates).some(s => s?.status === 'ready')) {
      selectFastest()
    }
  }, [providerStates, autoMode])

  const handleIframeLoad = () => {
    setLoadTime(Math.round(performance.now() - startTimeRef.current))
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
  }

  useEffect(() => {
    startTimeRef.current = performance.now()
  }, [embedUrl])

  useEffect(() => {
    testAllProviders()
  }, [])

  const currentState = providerStates[currentProvider]
  const readyCount = Object.values(providerStates).filter(s => s?.status === 'ready').length
  const allTested = testedRef.current.size === providers.length
  const fastestProvider = providers.find((_, i) => providerStates[i]?.status === 'ready' && providerStates[i]?.latency === Math.min(...Object.values(providerStates).filter(s => s?.status === 'ready').map(s => s!.latency || 999)))?.name || ''

  const getStatusBadge = (state: ProviderState, index: number) => {
    if (state?.status === 'testing') return <span style={styles.badgeTesting}>⚡</span>
    if (state?.status === 'ready' && state.latency) {
      const speed = state.latency < 100 ? '🔥' : state.latency < 300 ? '⚡' : '✓'
      return <span style={styles.badgeReady}>{speed} {state.latency}ms</span>
    }
    if (state?.status === 'failed') return <span style={styles.badgeFailed}>✕</span>
    return <span style={styles.badgeIdle}>○</span>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>StreamVault Player</h1>
          {autoMode && <span style={styles.autoBadge}>AUTO</span>}
          {readyCount > 0 && (
            <span style={styles.stats}>{readyCount}/{providers.length} sources ready</span>
          )}
        </div>
        <div style={styles.headerRight}>
          <button
            onClick={() => { setAutoMode(true); testAllProviders(); }}
            style={{ ...styles.btn, ...(autoMode ? styles.btnActive : styles.btnInactive) }}
          >
            ⚡ Auto
          </button>
          <button onClick={testAllProviders} style={styles.btnRefresh}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={styles.playerContainer}>
        {isLoading && (
          <div style={styles.loader}>
            <div style={styles.spinner}></div>
            <span>Loading from {providers[currentProvider].name}...</span>
            {loadTime && <span style={styles.loadTime}>{loadTime}ms</span>}
          </div>
        )}
        <iframe
          ref={iframeRef}
          key={currentProvider}
          src={embedUrl}
          width="100%"
          height="100%"
          style={styles.iframe}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          referrerPolicy="no-referrer"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>

      <div style={styles.providersSection}>
        <div style={styles.providersHeader}>
          <span style={styles.providersTitle}>Streaming Sources</span>
          {allTested && readyCount > 0 && !autoMode && (
            <button onClick={selectFastest} style={styles.btnFastest}>
              🔥 Switch to fastest ({fastestProvider})
            </button>
          )}
        </div>
        <div style={styles.providersGrid}>
          {providers.map((p, i) => (
            <button
              key={p.name}
              onClick={() => selectProvider(i)}
              style={{
                ...styles.providerBtn,
                ...(i === currentProvider ? styles.providerBtnActive : {}),
                ...(providerStates[i]?.status === 'failed' ? styles.providerBtnFailed : {}),
              }}
            >
              <span style={styles.providerName}>{p.name}</span>
              {getStatusBadge(providerStates[i] || {}, i)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>
          Currently using: <strong>{providers[currentProvider].name}</strong>
          {currentState?.latency && ` (${currentState.latency}ms)`}
        </span>
        <a href={embedUrl} target="_blank" rel="noreferrer" style={styles.footerLink}>
          Open in new tab ↗
        </a>
      </div>

      {readyCount === 0 && allTested && (
        <div style={styles.errorBox}>
          <strong>No sources available.</strong> If you have an ad blocker (uBlock, AdBlock, Privacy Badger), try disabling it for this site — these streaming sources are often blocked.
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#000',
    minHeight: '100vh',
    color: '#fff',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    display: 'flex',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    color: '#e50914',
  },
  autoBadge: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
  },
  stats: {
    fontSize: 12,
    color: '#888',
  },
  btn: {
    padding: '6px 12px',
    borderRadius: 6,
    border: 'none',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
  },
  btnInactive: {
    background: 'rgba(255,255,255,0.1)',
    color: '#888',
  },
  btnRefresh: {
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: 12,
    cursor: 'pointer',
  },
  btnFastest: {
    padding: '4px 10px',
    borderRadius: 4,
    border: '1px solid #f5c518',
    background: 'rgba(245,197,24,0.1)',
    color: '#f5c518',
    fontSize: 11,
    cursor: 'pointer',
  },
  playerContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: 1280,
    aspectRatio: '16/9',
    background: '#0a0a0a',
    borderRadius: 8,
    overflow: 'hidden',
    margin: '0 auto',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  loader: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: 'rgba(0,0,0,0.9)',
    zIndex: 10,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid rgba(255,255,255,0.1)',
    borderTopColor: '#e50914',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadTime: {
    fontSize: 12,
    color: '#888',
  },
  providersSection: {
    marginTop: 20,
    maxWidth: 1280,
    margin: '20px auto 0',
  },
  providersHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  providersTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#888',
  },
  providersGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 14px',
    borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    transition: 'all 0.2s',
  },
  providerBtnActive: {
    background: 'rgba(229,9,20,0.3)',
    borderColor: '#e50914',
  },
  providerBtnFailed: {
    opacity: 0.4,
  },
  providerName: {
    fontWeight: 500,
  },
  badgeIdle: {
    fontSize: 10,
    color: '#555',
  },
  badgeTesting: {
    fontSize: 10,
    color: '#f5c518',
  },
  badgeReady: {
    fontSize: 10,
    color: '#4ade80',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  badgeFailed: {
    fontSize: 10,
    color: '#ef4444',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTop: '1px solid rgba(255,255,255,0.1)',
    maxWidth: 1280,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  footerText: {
    fontSize: 12,
    color: '#888',
  },
  footerLink: {
    color: '#fff',
    fontSize: 12,
    textDecoration: 'none',
    opacity: 0.7,
  },
  errorBox: {
    marginTop: 20,
    padding: '16px 20px',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    fontSize: 13,
    color: '#fca5a5',
    textAlign: 'center',
  },
}
