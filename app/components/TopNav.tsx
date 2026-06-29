'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export type Notification = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
}

type TopNavProps = {
  active?: string
  onNavigate?: (target: string) => void
  onMarkAllRead?: () => void
  notifications?: Notification[]
  onNotifClick?: (id: string) => void
}

const NAV_LINKS = [
  { id: 'browse', label: 'Browse', href: '/browse' },
  { id: 'search', label: 'Search', href: '/search' },
  { id: 'sports', label: 'Sports', href: '/sports' },
  { id: 'f1', label: 'F1', href: '/f1' },
  { id: 'community', label: 'Community' },
  { id: 'myspace', label: 'My Space' },
]

const HOME_PAGES = new Set(['community', 'myspace', 'settings'])

export default function TopNav({ active, onNavigate, onMarkAllRead, notifications = [], onNotifClick }: TopNavProps) {
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 60)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const homeJump = (target: string) => {
    try {
      localStorage.setItem('vaultsphere_current_page', target)
      localStorage.setItem('vaultsphere_selected_movie', 'null')
    } catch (err) {}
    router.push('/')
  }

  const goHome = () => {
    try {
      localStorage.removeItem('vaultsphere_current_page')
      localStorage.removeItem('vaultsphere_selected_movie')
    } catch (err) {}
    router.push('/')
  }

  const handleNavigate = (target: string, href?: string) => {
    if (onNavigate) {
      onNavigate(target)
      setMobileNavOpen(false)
      setNotifOpen(false)
      return
    }
    if (target === 'home') {
      goHome()
    } else if (href) {
      router.push(href)
    } else if (HOME_PAGES.has(target)) {
      homeJump(target)
    }
    setMobileNavOpen(false)
    setNotifOpen(false)
  }

  const onEnter = (action: () => void) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  const navLinks = useMemo(() => NAV_LINKS, [])

  return (
    <>
      <nav id="nav" className={navScrolled ? 'scrolled' : 'solid'}>
        <div
          className="logo focusable"
          role="button"
          tabIndex={0}
          onClick={() => handleNavigate('home')}
          onKeyDown={onEnter(() => handleNavigate('home'))}
        >
          VAULT<span>SPHERE</span>
        </div>
        <button
          className="mobile-nav-toggle"
          aria-expanded={mobileNavOpen}
          aria-label="Open navigation menu"
          onClick={() => setMobileNavOpen(prev => !prev)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className={`nav-center ${mobileNavOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <span
              key={link.id}
              className={`nav-link ${active === link.id ? 'active' : ''} focusable`}
              role="button"
              tabIndex={0}
              onClick={() => handleNavigate(link.id, link.href)}
              onKeyDown={onEnter(() => handleNavigate(link.id, link.href))}
            >
              {link.label}
            </span>
          ))}
        </div>
        <div className="nav-right">
          <button className="nav-icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
            <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {unreadCount > 0 && (
              <span className="notif-dot" style={unreadCount > 1 ? { fontSize: 9, width: 18, height: 18, lineHeight: '18px', textAlign: 'center' } : {}}>
                {unreadCount > 1 ? unreadCount : ''}
              </span>
            )}
          </button>
          <button className="nav-icon-btn" onClick={() => handleNavigate('settings')}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <div
            className="avatar-btn focusable"
            role="button"
            tabIndex={0}
            onClick={() => handleNavigate('myspace')}
            onKeyDown={onEnter(() => handleNavigate('myspace'))}
          >
            A
          </div>
        </div>
      </nav>

      <div className={`mobile-nav-backdrop ${mobileNavOpen ? 'visible' : ''}`} onClick={() => setMobileNavOpen(false)} />
      <div className={`notif-dropdown ${notifOpen ? 'open' : ''}`} ref={notifRef}>
        <div className="nd-head">
          <h3>Notifications</h3>
          {notifications.some(n => !n.read) && (
            <span onClick={() => { onMarkAllRead?.(); setNotifOpen(false) }}>Mark all read</span>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="notif-empty">No notifications yet</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className="notif-item" onClick={() => onNotifClick?.(n.id)}>
              {!n.read && <div className="notif-dot2"></div>}
              <div className="notif-item-text" style={n.read ? { marginLeft: 20 } : {}}>
                <h4>{n.title}</h4>
                <p>{n.body}</p>
                <span>{n.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
