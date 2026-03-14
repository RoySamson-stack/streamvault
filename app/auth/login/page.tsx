'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/')
    router.refresh()
  }

  async function handleOAuth(provider: 'google' | 'github') {
    const supabase = createClient()
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
      <AuthCard>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2,
          marginBottom: 6, textAlign: 'center',
        }}>Welcome Back</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 28 }}>
          Sign in to continue watching
        </p>

        <OAuthBtn provider="google" onClick={() => handleOAuth('google')}>
          <GoogleIcon /> Continue with Google
        </OAuthBtn>
        <OAuthBtn provider="github" onClick={() => handleOAuth('github')} style={{ marginTop: 10 }}>
          <GithubIcon /> Continue with GitHub
        </OAuthBtn>

        <Divider />

        <form onSubmit={handleLogin}>
          <Field label="Email">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required
              style={inputStyle}
            />
          </Field>
          <Field label="Password" style={{ marginTop: 16 }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14 }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8, marginBottom: 20 }}>
            <Link href="/auth/forgot" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          {error && (
            <div style={{
              background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ff6b6b', marginBottom: 16,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 8, border: 'none',
            background: loading ? 'rgba(229,9,20,.5)' : 'var(--accent)',
            color: '#fff', fontSize: 15, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background .2s', letterSpacing: '.3px',
          }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 24 }}>
          No account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </AuthCard>
    </div>
  )
}

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,.08)', borderRadius: 16,
      padding: '40px 36px', boxShadow: '0 32px 80px rgba(0,0,0,.5)',
    }}>{children}</div>
  )
}

function OAuthBtn({ children, onClick, style }: { children: React.ReactNode; onClick: () => void; provider: string; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 500,
      color: '#fff', fontFamily: "'Outfit', sans-serif", cursor: 'pointer',
      transition: 'all .2s', ...style,
    }}
    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)')}
    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)')}
    >{children}</button>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
    </div>
  )
}

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 7, letterSpacing: '.5px' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
  borderRadius: 8, color: '#fff', fontSize: 14,
  fontFamily: "'Outfit', sans-serif", outline: 'none',
  transition: 'border-color .2s',
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
