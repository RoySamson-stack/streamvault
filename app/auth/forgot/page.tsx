'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSent(true)
  }

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
      <div style={{
        background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 16,
        padding: '40px 36px', boxShadow: '0 32px 80px rgba(0,0,0,.5)',
      }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 2, marginBottom: 10 }}>
              Check Your Email
            </h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>
              A reset link was sent to <strong style={{ color: '#fff' }}>{email}</strong>.<br />
              It expires in 1 hour.
            </p>
            <Link href="/auth/login" style={{
              display: 'inline-block', background: 'var(--accent)', color: '#fff',
              textDecoration: 'none', padding: '12px 32px', borderRadius: 8,
              fontSize: 14, fontWeight: 600,
            }}>Back to Sign In</Link>
          </div>
        ) : (
          <>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: 2,
              marginBottom: 6, textAlign: 'center',
            }}>Reset Password</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 28 }}>
              Enter your email and we'll send you a link
            </p>

            <form onSubmit={handleReset}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 7, letterSpacing: '.5px' }}>
                Email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                style={{
                  width: '100%', padding: '12px 14px',
                  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 8, color: '#fff', fontSize: 14,
                  fontFamily: "'Outfit', sans-serif", outline: 'none', marginBottom: 20,
                }}
              />

              {error && (
                <div style={{
                  background: 'rgba(229,9,20,.1)', border: '1px solid rgba(229,9,20,.3)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13,
                  color: '#ff6b6b', marginBottom: 16,
                }}>{error}</div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px', borderRadius: 8, border: 'none',
                background: loading ? 'rgba(229,9,20,.5)' : 'var(--accent)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                fontFamily: "'Outfit', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .2s',
              }}>{loading ? 'Sending…' : 'Send Reset Link'}</button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 24 }}>
              Remember it?{' '}
              <Link href="/auth/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
