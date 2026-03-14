// app/auth/layout.tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'StreamVault — Sign In' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 'var(--nav-h)',
        background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,.04)',
      }}>
        <Link href="/" style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 3,
          background: 'linear-gradient(135deg,#e50914,#ff6b35)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textDecoration: 'none',
        }}>StreamVault</Link>
        <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none' }}>
          Sign In
        </Link>
      </nav>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg,#0a0010 0%,#100020 35%,#1a0a00 70%,#080810 100%)',
        }} />
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(229,9,20,.12) 0%,transparent 70%)',
          top: -200, right: -150,
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(255,107,53,.1) 0%,transparent 70%)',
          bottom: -100, left: -100,
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--nav-h)' }}>
        {children}
      </div>
    </div>
  )
}
