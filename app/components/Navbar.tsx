'use client'
// components/Navbar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: 'var(--nav-h)',
      background: scrolled
        ? 'rgba(8,8,16,0.97)'
        : 'linear-gradient(to bottom,rgba(8,8,16,0.9) 0%,transparent 100%)',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.04)' : 'none',
      transition: 'background 0.3s, backdrop-filter 0.3s',
    }}>
      {/* Logo */}
      <Link href="/" style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 3,
        background: 'linear-gradient(135deg,#e50914,#ff6b35)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        textDecoration: 'none',
      }}>StreamVault</Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {[
          { label: 'Home', href: '/' },
          { label: 'Movies', href: '#movies' },
          { label: 'Series', href: '#series' },
          { label: 'Sports', href: '#sports' },
          { label: 'Anime', href: '#anime' },
          { label: 'Live TV', href: '#live' },
        ].map(({ label, href }) => (
          <a key={label} href={href} style={{
            color: 'var(--muted)', textDecoration: 'none',
            fontSize: 13, fontWeight: 500, letterSpacing: '.4px',
            transition: 'color .2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
          >{label}</a>
        ))}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <input
          placeholder="🔍  Search titles…"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 20, padding: '7px 16px',
            color: '#fff', fontSize: 13,
            fontFamily: "'Outfit', sans-serif",
            outline: 'none', width: searchOpen ? 220 : 150,
            transition: 'width .3s, border-color .3s',
          }}
          onFocus={e => {
            setSearchOpen(true)
            e.currentTarget.style.borderColor = 'rgba(229,9,20,.5)'
          }}
          onBlur={e => {
            setSearchOpen(false)
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
          }}
        />
        {/* Notifications bell */}
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: 18, lineHeight: 1,
          transition: 'color .2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}
        >🔔</button>
        {/* Avatar / profile */}
        <Link href="/auth/login" style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'linear-gradient(135deg,#e50914,#ff6b35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          textDecoration: 'none', cursor: 'pointer',
        }}>J</Link>
      </div>
    </nav>
  )
}
