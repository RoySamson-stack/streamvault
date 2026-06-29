'use client'

import { useEffect, useState } from 'react'
import TopNav from '../components/TopNav'

const YEAR = 2026

interface F1Replay {
  year: string
  grandPrix: string
  session: string
  url: string
}

const normalizeUrl = (raw: string) => raw.startsWith('//') ? `https:${raw}` : raw

type Payload = Record<string, any>

const toArray = (payload: Payload | null, keys: string[]) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  return []
}

const extractSessions = (payload: Payload) => toArray(payload, ['sessions', 'data'])
const extractEvents = (payload: Payload) => toArray(payload, ['messages', 'events', 'data', 'updates', 'items'])

const formatTime = (value?: string) => {
  if (!value) return 'TBA'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const renderEventMessage = (event: Payload) => {
  return event.message || event.text || event.detail || event.description || event.note || JSON.stringify(event)
}

const FILTERS = ['ALL', 'FLAG', 'SAFETYCAR', 'DRS', 'OTHER']

export default function F1Page() {
  const [sessions, setSessions] = useState<Payload[]>([])
  const [sessionsError, setSessionsError] = useState('')
  const [raceControl, setRaceControl] = useState<Payload[]>([])
  const [raceControlError, setRaceControlError] = useState('')
  const [teamRadio, setTeamRadio] = useState<Payload[]>([])
  const [teamRadioError, setTeamRadioError] = useState('')
  const [replays, setReplays] = useState<F1Replay[]>([])
  const [replaysError, setReplaysError] = useState('')
  const [selectedReplay, setSelectedReplay] = useState<F1Replay | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMessageFilter, setActiveMessageFilter] = useState(FILTERS[0])

  useEffect(() => {
    let canceled = false
    const safeFetch = async (path: string) => {
      const res = await fetch(path)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      return res.json()
    }

    Promise.allSettled([
      safeFetch(`/api/f1/sessions?year=${YEAR}`),
      safeFetch(`/api/f1/race-control?year=${YEAR}`),
      safeFetch(`/api/f1/team-radio?year=${YEAR}`),
      safeFetch('/api/f1/replays'),
    ]).then(([sessionsResult, raceControlResult, teamRadioResult, replaysResult]) => {
      if (canceled) return

      if (sessionsResult.status === 'fulfilled') {
        setSessions(extractSessions(sessionsResult.value))
      } else {
        setSessionsError(sessionsResult.reason?.message || 'Unable to load session schedule.')
      }

      if (raceControlResult.status === 'fulfilled') {
        setRaceControl(extractEvents(raceControlResult.value))
      } else {
        setRaceControlError(raceControlResult.reason?.message || 'Unable to load race control updates.')
      }

      if (teamRadioResult.status === 'fulfilled') {
        setTeamRadio(extractEvents(teamRadioResult.value))
      } else {
        setTeamRadioError(teamRadioResult.reason?.message || 'Unable to load team radio.')
      }

      if (replaysResult.status === 'fulfilled') {
        setReplays(replaysResult.value.replays || [])
      } else {
        setReplaysError('Unable to load replay links right now.')
      }
    }).catch((err) => {
      console.error('F1 data fetch error:', err)
    }).finally(() => {
      if (!canceled) setLoading(false)
    })

    return () => { canceled = true }
  }, [])

  return (
    <>
      <TopNav active="f1" />
      <div className="f1-page">
        <div className="f1-main">
        <div className="f1-left-panel">
          <div className="video-wrap">
          <div className="live-badge">
            <div className="live-dot" />
            {selectedReplay ? 'REPLAY' : 'LIVE'}
          </div>
          <iframe
            className="f1-iframe"
            src={selectedReplay ? normalizeUrl(selectedReplay.url) : 'https://lovetier.bz/player/SkySportsF1'}
            allowFullScreen
            title={selectedReplay ? `${selectedReplay.grandPrix} · ${selectedReplay.session}` : 'Sky Sports F1'}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
          </div>
          <div className="video-controls">
            <div className="vc-live">
              <div className="vc-live-dot" />
              LIVE
            </div>
            <span className="stream-label">Stream 1</span>
            <button className="ctrl-btn"><span className="ctrl-key">F</span> Fullscreen</button>
            <button className="ctrl-btn"><span className="ctrl-key">M</span> Mute</button>
            <button className="ctrl-btn"><span className="ctrl-key">←</span> -10s</button>
            <button className="ctrl-btn"><span className="ctrl-key">→</span> +10s</button>
            <button className="ctrl-btn"><span className="ctrl-key">I</span> Picture-in-Picture</button>
            <button className="select-stream-btn">
              <span className="radio-icon">
                <span className="radio-bar"></span>
                <span className="radio-bar"></span>
                <span className="radio-bar"></span>
              </span>
              Select Stream
            </button>
          </div>
          <div className="bottom-panels">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h4"/></svg>
                  Race Control
                </div>
                <span className="panel-count">{raceControl.length} messages</span>
              </div>
              <div className="filter-bar">
                {FILTERS.map(filter => (
                  <button key={filter} className={`filter-btn ${activeMessageFilter === filter ? 'active' : ''}`} onClick={() => setActiveMessageFilter(filter)}>{filter}</button>
                ))}
              </div>
              <div className="panel-body">
                {loading ? (
                  <div className="panel-empty"><span className="panel-empty-title">Syncing…</span></div>
                ) : raceControl.length === 0 ? (
                  <div className="panel-empty"><span className="panel-empty-title">No messages yet</span></div>
                ) : (
                  <div className="panel-messages">
                    {raceControl.slice(0, 4).map((event, idx) => (
                      <div key={idx} className="panel-message">
                        <span className="panel-message-time">{formatTime(event.time || event.timestamp || event.created_at)}</span>
                        <span className="panel-message-text">{renderEventMessage(event)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <span className="radio-icon">
                    <span className="radio-bar"></span>
                    <span className="radio-bar"></span>
                    <span className="radio-bar"></span>
                  </span>
                  Team Radio
                </div>
                <span className="panel-count">{teamRadio.length} clips</span>
              </div>
              <div className="panel-body">
                {loading ? (
                  <div className="panel-empty"><span className="panel-empty-title">Connecting…</span></div>
                ) : teamRadio.length === 0 ? (
                  <div className="panel-empty"><span className="panel-empty-title">No radio clips</span></div>
                ) : (
                  <div className="panel-messages">
                    {teamRadio.slice(0, 4).map((event, idx) => (
                      <div key={idx} className="panel-message">
                        <span className="panel-message-time">{formatTime(event.time || event.timestamp)}</span>
                        <span className="panel-message-text">{event.driver || event.team ? `${event.driver || event.team}: ` : ''}{renderEventMessage(event)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <aside className="sidebar">
          <div className="sidebar-inner">
            <div className="sidebar-head">
              <span>Replay links ({replays.length})</span>
              <span className="f1-year-tag">{YEAR}</span>
            </div>
            <div className="f1-replay-grid">
            {loading ? (
              <p className="f1-helper">Fetching replay list…</p>
            ) : replaysError ? (
              <p className="f1-helper">{replaysError}</p>
            ) : replays.length === 0 ? (
              <p className="f1-helper">No replay links available yet.</p>
            ) : (
              replays.slice(0, 8).map((entry, idx) => (
                <button
                  className={`f1-replay-card ${selectedReplay === entry ? 'active' : ''}`}
                  key={`${entry.grandPrix}-${entry.session}-${idx}`}
                  type="button"
                  onClick={() => setSelectedReplay(entry)}
                >
                  <span className="f1-replay-gp">{entry.year} · {entry.grandPrix}</span>
                  <span className="f1-replay-session">{entry.session}</span>
                  <span className="f1-replay-action">{selectedReplay === entry ? 'Now Playing' : 'Watch Replay'}</span>
                </button>
              ))
            )}
            </div>
            <div className="f1-session-list">
              <div className="sidebar-head">
                <span>2026 sessions</span>
                <span className="f1-year-tag">Schedule</span>
              </div>
              {loading ? (
                <p className="f1-helper">Loading schedule…</p>
              ) : sessionsError ? (
                <p className="f1-helper">{sessionsError}</p>
              ) : (
                sessions.slice(0, 3).map((session, idx) => (
                  <div key={`sess-${idx}`} className="f1-session-item">
                    <span className="f1-session-title">{session.grand_prix || session.name || session.event || 'Session'}</span>
                    <span className="f1-session-meta">{session.session || session.category || session.type || 'Session'}</span>
                    <span className="f1-session-time">{formatTime(session.start_time || session.time)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
      </div>
    </>
  )
}
