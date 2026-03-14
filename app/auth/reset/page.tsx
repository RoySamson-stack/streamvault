'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); setLoading(false); return }
    setDone(true)
    setTimeout(() => router.push('/'), 2500)
  }

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
      <div style={{
        background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,.08)', borderRadius: 16,
        padding: '40px 36px', boxShadow: '0 32px 80px rgba(0,0,0,.5)',
      }}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 2, marginBottom: 10 }}>Password Updated</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>Redirecting you to the homepage…</p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, letterSpacing: 2, marginBottom: 6, textAlign: 'center' }}>
              New Password
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginBottom: 28 }}>
              Choose a strong password for your account
            </p>
            <form onSubmit={handleReset}>
              {[
                { label: 'New Password', value: password, set: setPassword },
                { label: 'Confirm Password', value: confirm, set: setConfirm },
              ].map(({ label, value, set }) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.6)', marginBottom: 7, letterSpacing: '.5px' }}>{label}</label>
                  <input
                    type="password" value={value} onChange={e => set(e.target.value)} required
                    style={{
                      width: '100%', padding: '12px 14px',
                      background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
                      borderRadius: 8, color: '#fff', fontSize: 14,
                      fontFamily: "'Outfit', sans-serif", outline: 'none',
                    }}
                  />
                </div>
              ))}
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
                transition: 'background .2s', marginTop: 8,
              }}>{loading ? 'Updating…' : 'Update Password'}</button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 20 }}>
              <Link href="/auth/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>← Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
