// app/auth/layout.tsx
import type { Metadata } from 'next'
import TopNav from '../components/TopNav'

export const metadata: Metadata = { title: 'Sign In', description: 'Sign in to your VaultSphere account to access your watchlist and continue watching.' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      <TopNav />

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

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--nav)' }}>
        {children}
      </div>
    </div>
  )
}
