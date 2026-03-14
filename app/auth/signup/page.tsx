'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const pw = form.password
  const strength = pw.length === 0 ? 0 : pw.length < 6 ? 1 : pw.length < 10 ? 2 : /[^a-zA-Z0-9]/.test(pw) ? 4 : 3
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColor = ['', '#e50914', '#f5c518', '#1a6dff', '#22c55e']

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true)
  }

  async function handleOAuth(provider: 'google' | 'github') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{
          background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,.08)', borderRadius: 16,
          padding: '48px 36px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 2, marginBottom: 10 }}>
            Check Your Email
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>
            We sent a confirmation link to <strong style={{ color: '#fff' }}>{form.email}</strong>.
            Click it to activate your account.
          </p>
          <Link href="/auth/login" style={{
            display: 'inline-block', background: 'var(--accent)', color: '#fff',
            textDecoration: 'none', padding: '12px 32px', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
          }}>Back to Sign In</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 440, padding: '0 24px' }}>
      <div style={{
        background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 16,
        padding: '40px 36px', boxShadow: '0 32px 80px rgba(0,0,0,.5)',
      }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 2,
          marginBottom: 6, textAlign: 'center',
        }}>Create Account</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 28 }}>
          Start streaming in seconds — free forever
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <OAuthBtn onClick={() => handleOAuth('google')}>
            <GoogleIcon /> Google
          </OAuthBtn>
          <OAuthBtn onClick={() => handleOAuth('github')}>
            <GithubIcon /> GitHub
          </OAuthBtn>
        </div>

        <Divider />

        <form onSubmit={handleSignup}>
          <Field label="Full Name">
            <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Doe" required style={inputStyle} />
          </Field>

          <Field label="Email" style={{ marginTop: 14 }}>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={inputStyle} />
          </Field>

          <Field label="Password" style={{ marginTop: 14 }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')}
                placeholder="Min 6 characters" required style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 14,
              }}>{showPw ? '🙈' : '👁'}</button>
            </div>
            {pw.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= strength ? strengthColor[strength] : 'rgba(255,255,255,.1)',
                      transition: 'background .3s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthColor[strength], marginTop: 4, display: 'block' }}>
                  {strengthLabel[strength]}
                </span>
              </div>
            )}
          </Field>

          <Field label="Confirm Password" style={{ marginTop: 14 }}>
            <input
              type="password" value={form.confirm} onChange={set('confirm')}
              placeholder="Repeat password" required style={inputStyle}
            />
          </Field>

          {error && (
            <div style={{
              background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#ff6b6b',
              marginTop: 16,
            }}>{error}</div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 8, border: 'none',
            background: loading ? 'rgba(229,9,20,.5)' : 'var(--accent)',
            color: '#fff', fontSize: 15, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background .2s', marginTop: 24, letterSpacing: '.3px',
          }}>{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 16, lineHeight: 1.6 }}>
          By signing up you agree to our{' '}
          <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Terms</a> and{' '}
          <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

function OAuthBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)',
      borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 500,
      color: '#fff', fontFamily: "'Outfit', sans-serif", cursor: 'pointer', transition: 'all .2s',
    }}
    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.1)')}
    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)')}
    >{children}</button>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
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
  fontFamily: "'Outfit', sans-serif", outline: 'none', transition: 'border-color .2s',
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
