// lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Return null if not configured
export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase not configured - set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return null
  }
  return createBrowserClient(supabaseUrl, supabaseKey)
}

// Singleton for client components (may be null)
export const supabase = createClient()
