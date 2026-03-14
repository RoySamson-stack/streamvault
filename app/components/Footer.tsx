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
        <span>Privacy · Terms · Cookie Preferences</span>
      </div>
    </footer>
  )
}
