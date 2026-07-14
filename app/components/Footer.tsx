'use client'
// components/Footer.tsx
export default function Footer() {
  return (
    <footer style={{ padding: '48px', borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 24 }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: 3, marginBottom: 6,
        background: 'linear-gradient(135deg,#e50914,#ff6b35)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>StreamVault</div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        Your universe of entertainment, all in one place.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, marginBottom: 32 }}>
        {[
          { heading: 'Browse', links: ['Movies', 'TV Series', 'Sports', 'Anime', 'Live TV', 'Kids'] },
          { heading: 'Account', links: ['My Profile', 'Watchlist', 'Watch History', 'Downloads', 'Settings'] },
          { heading: 'Support', links: ['Help Center', 'Contact Us', 'Device Support', 'Accessibility'] },
          { heading: 'Company', links: ['About Us', 'Careers', 'Press', 'Advertise', 'Investors'] },
        ].map(col => (
          <div key={col.heading}>
            <h4 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              {col.heading}
            </h4>
            {col.links.map(link => (
              <a key={link} href="#" style={{
                display: 'block', fontSize: 13, color: 'rgba(255,255,255,.4)',
                textDecoration: 'none', marginBottom: 8, transition: 'color .2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.4)')}
              >{link}</a>
            ))}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)',
        fontSize: 12, color: 'var(--muted)',
      }}>
        <span>© 2025 StreamVault, Inc. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a
            href="/VaultSphere.apk"
            download
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 6,
              background: 'linear-gradient(135deg, #1a6dff, #0d47a1)',
              color: '#fff', fontSize: 12, fontWeight: 600,
              textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(26,109,255,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.523 2H6.477A4.477 4.477 0 0 0 2 6.477v11.046A4.477 4.477 0 0 0 6.477 22h11.046A4.477 4.477 0 0 0 22 17.523V6.477A4.477 4.477 0 0 0 17.523 2zM12 17.5l-5-5h3V6h4v6.5h3l-5 5z"/></svg>
            Get Android App
          </a>
          <span>Privacy · Terms · Cookie Preferences</span>
        </div>
      </div>
    </footer>
  )
}
