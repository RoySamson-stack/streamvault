// lib/supabase.ts
// ─────────────────────────────────────────────────────────
// Two clients:
//   supabase        → browser/client-side usage
//   createServerClient (imported from @supabase/ssr) → server components / route handlers
// ─────────────────────────────────────────────────────────

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton for client components
export const supabase = createClient()
