# streamvault

# StreamVault 🎬

> Netflix-level streaming platform frontend built with **Next.js 14**, **TypeScript**, and **Supabase Auth**.

---

## Project Structure

```
streamvault/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage (all content rows)
│   ├── globals.css             # Global styles + CSS variables
│   ├── components/
│   │   ├── Navbar.tsx          # Sticky nav with search
│   │   ├── HeroSection.tsx     # Auto-cycling hero banner
│   │   ├── ContentCard.tsx     # Reusable movie/show card
│   │   ├── ContentRow.tsx      # Horizontal scroll carousel
│   │   ├── SportsRow.tsx       # Live sports cards
│   │   └── Footer.tsx          # Site footer
│   └── auth/
│       ├── layout.tsx          # Shared auth layout (logo + bg)
│       ├── callback/route.ts   # OAuth redirect handler
│       ├── login/page.tsx      # Login page
│       ├── signup/page.tsx     # Signup page + strength meter
│       └── forgot/page.tsx     # Forgot password page
├── lib/
│   ├── supabase.ts             # Supabase browser client
│   └── data.ts                 # All mock content data
├── middleware.ts               # Session refresh + route protection
├── next.config.js
├── tsconfig.json
└── .env.local                  # ← fill in your Supabase keys
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Copy your **Project URL** and **anon public** key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Enable Auth providers in Supabase
Go to **Authentication → Providers** in your Supabase dashboard and enable:
- **Email** (enabled by default)
- **Google** — requires Google Cloud OAuth credentials
- **GitHub** — requires a GitHub OAuth App

For OAuth providers, set the **redirect URL** to:
```
https://your-project.supabase.co/auth/v1/callback
```

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_APP_URL  (set to your production URL)
```

Or connect your GitHub repo directly at [vercel.com](https://vercel.com) — it auto-detects Next.js.

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Homepage — hero, carousels, sports, anime |
| `/auth/login` | Sign in (email + OAuth) |
| `/auth/signup` | Register + password strength meter |
| `/auth/forgot` | Send password reset email |
| `/auth/reset` | (add later) Update password after reset |
| `/auth/callback` | Supabase OAuth redirect handler |

---

## Connecting Real Content (Supabase)

Replace the mock arrays in `lib/data.ts` with Supabase queries. Example:

```ts
// In a Server Component or API route:
import { createServerClient } from '@supabase/ssr'

const { data: movies } = await supabase
  .from('content')
  .select('*')
  .eq('type', 'movie')
  .order('popularity', { ascending: false })
  .limit(10)
```

Suggested Supabase table: `content`
| column | type |
|---|---|
| id | uuid |
| title | text |
| type | text (movie/series/anime) |
| genre | text[] |
| rating | float |
| year | int |
| poster_url | text |
| backdrop_url | text |
| description | text |
| runtime | int (minutes) |
| badge | text (nullable) |

---

## Next Steps to Build Out

- [ ] Individual title page (`/watch/[id]`)
- [ ] Video player page
- [ ] Watchlist (saved to Supabase)
- [ ] User profile & settings
- [ ] Search overlay with results
- [ ] Admin content manager
- [ ] Subscription / payments (Stripe)
