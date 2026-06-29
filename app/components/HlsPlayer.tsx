'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Hls from 'hls.js'

interface HlsPlayerProps {
  src: string
  poster?: string | null
  onReady?: () => void
  onError?: () => void
  autoPlay?: boolean
}

export default function HlsPlayer({ src, poster, onReady, onError, autoPlay = true }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [quality, setQuality] = useState<number>(-1) // -1 = auto
  const [levels, setLevels] = useState<{ height: number; index: number }[]>([])
  const [buffering, setBuffering] = useState(true)

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Native HLS support (Safari/iOS)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.addEventListener('loadedmetadata', () => {
        setBuffering(false)
        onReady?.()
        if (autoPlay) video.play().catch(() => {})
      })
      video.addEventListener('error', () => onError?.())
      return
    }

    if (!Hls.isSupported()) {
      onError?.()
      return
    }

    destroyHls()

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      startLevel: -1, // auto
      capLevelToPlayerSize: true,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000, // 60MB
      maxBufferHole: 0.5,
    })

    hlsRef.current = hls
    hls.loadSource(src)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
      const lvls = data.levels.map((l, i) => ({ height: l.height, index: i }))
      setLevels(lvls)
      setBuffering(false)
      onReady?.()
      if (autoPlay) video.play().catch(() => {})
    })

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad() // retry
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError()
        } else {
          onError?.()
        }
      }
    })

    return () => destroyHls()
  }, [src, autoPlay, onReady, onError, destroyHls])

  // Quality switching
  useEffect(() => {
    if (!hlsRef.current) return
    hlsRef.current.currentLevel = quality // -1 = auto
  }, [quality])

  // Buffering state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onWaiting = () => setBuffering(true)
    const onPlaying = () => setBuffering(false)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('playing', onPlaying)
    return () => {
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('playing', onPlaying)
    }
  }, [])

  return (
    <div className="hls-player">
      {buffering && (
        <div className="hls-player-loading">
          <div className="spinner" />
        </div>
      )}
      <video
        ref={videoRef}
        poster={poster || undefined}
        controls
        playsInline
        className="hls-video"
      />
      {levels.length > 1 && (
        <div className="hls-quality-selector">
          <select
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            aria-label="Video quality"
          >
            <option value={-1}>Auto</option>
            {levels.map((l) => (
              <option key={l.index} value={l.index}>
                {l.height}p
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
