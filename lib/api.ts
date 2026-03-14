// lib/api.ts
// ─────────────────────────────────────────────────────────
// All calls to the FastAPI backend live here.
// Import from this file instead of lib/data.ts once backend is running.
// ─────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

// ── Shared types (mirror schemas.py) ──────────────────────

export interface ContentItem {
  id: string
  title: string
  seed?: string
  type: "movie" | "series" | "anime" | "sport"
  year?: number
  rating?: number
  poster?: string
  backdrop?: string
  genres: string[]
  genre?: string[]
  description?: string
  badge?: string
  badgeColor?: 'red' | 'blue' | 'gold'
  progress?: number
  episode?: string
}

export interface HomepageSection {
  title: string
  items: ContentItem[]
}

export interface HomepageResponse {
  sections: HomepageSection[]
}

export interface SearchResponse {
  query: string
  results: ContentItem[]
  total: number
}

export interface CastMember {
  name: string
  role?: string
  photo?: string
}

export interface Episode {
  season: number
  episode: number
  title?: string
  description?: string
  thumbnail?: string
  duration_mins?: number
}

export interface Season {
  number: number
  episodes: Episode[]
}

export interface ItemDetail extends ContentItem {
  pg_rating?: string
  runtime_mins?: number
  cast: CastMember[]
  seasons: Season[]
}

export interface StreamSource {
  quality: string
  url: string
  size_mb?: number
}

export interface Subtitle {
  language: string
  url: string
}

export interface StreamResponse {
  id: string
  title: string
  season?: number
  episode?: number
  sources: StreamSource[]
  subtitles: Subtitle[]
}

export interface PopularSearchResponse {
  searches: string[]
}

// ── Fetch helper ──────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    // Next.js caching: revalidate homepage every 5 minutes, search/stream no-store
    next: path.startsWith("/homepage") ? { revalidate: 300 } : undefined,
    cache: path.startsWith("/homepage") ? undefined : "no-store",
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? `API error ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ── API functions ─────────────────────────────────────────

/** Trending / featured sections for the homepage */
export async function getHomepage(): Promise<HomepageResponse> {
  return apiFetch<HomepageResponse>("/homepage")
}

/** Search movies and TV series */
export async function searchContent(query: string, page = 1): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, page: String(page) })
  return apiFetch<SearchResponse>(`/search?${params}`)
}

/** Popular search terms */
export async function getPopularSearches(): Promise<PopularSearchResponse> {
  return apiFetch<PopularSearchResponse>("/search/popular")
}

/** Full details for a movie or series */
export async function getItemDetail(id: string): Promise<ItemDetail> {
  return apiFetch<ItemDetail>(`/content/${id}`)
}

/** Stream URLs for a movie */
export async function getMovieStream(id: string, quality = "1080p"): Promise<StreamResponse> {
  return apiFetch<StreamResponse>(`/content/${id}/stream?quality=${quality}`)
}

/** Stream URLs for a series episode */
export async function getEpisodeStream(
  id: string,
  season: number,
  episode: number,
  quality = "1080p"
): Promise<StreamResponse> {
  return apiFetch<StreamResponse>(
    `/content/${id}/stream/s${season}e${episode}?quality=${quality}`
  )
}

/** Health check */
export async function healthCheck() {
  return apiFetch<{ status: string; host: string }>("/system/health")
}
