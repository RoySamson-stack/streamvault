// lib/tmdb.ts
const KEY = process.env.NEXT_PUBLIC_TMDB_KEY
const BASE = process.env.NEXT_PUBLIC_TMDB_BASE || 'https://api.themoviedb.org/3'
const IMG = process.env.NEXT_PUBLIC_TMDB_IMG || 'https://image.tmdb.org/t/p'

export const img = (path: string | null, size = 'w500'): string | null => 
  path ? `${IMG}/${size}${path}` : null

export const backdrop = (path: string | null): string | null =>
  img(path, 'w1280')

export const poster = (path: string | null): string | null =>
  img(path, 'w500')

export const tmdbFetch = async <T>(endpoint: string): Promise<T> => {
  if (!KEY || KEY === 'YOUR_TMDB_API_KEY_HERE') {
    throw new Error('TMDB API key not configured')
  }
  const url = `${BASE}${endpoint}&api_key=${KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status}`)
  }
  return res.json()
}

// Types
export interface TMDBMovie {
  id: number
  title: string
  original_title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  adult: boolean
  original_language: string
  popularity: number
}

export interface TMDBSearchResult {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  name?: string
  title?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  vote_average: number
  first_air_date?: string
  release_date?: string
}

export interface TMDBCredits {
  id: number
  cast: {
    id: number
    name: string
    character: string
    profile_path: string | null
  }[]
  crew: {
    id: number
    name: string
    job: string
    department: string
  }[]
}

export interface TMDBVideos {
  id: number
  results: {
    id: string
    key: string
    name: string
    site: string
    type: string
  }[]
}

export interface TMDBMovieDetail extends TMDBMovie {
  genres: { id: number; name: string }[]
  runtime: number | null
  tagline: string | null
  status: string
  budget: number
  revenue: number
  credits: TMDBCredits
  videos: TMDBVideos
}

export interface TMDBSearchResponse {
  page: number
  results: TMDBSearchResult[]
  total_pages: number
  total_results: number
}

// Homepage rows
export const getTrending = () => tmdbFetch<TMDBMovieResponse>('/trending/movie/week?language=en-US&page=1')
export const getTrendingTV = () => tmdbFetch<TMDBMovieResponse>('/trending/tv/week?language=en-US&page=1')
export const getPopularMovies = () => tmdbFetch<TMDBMovieResponse>('/movie/popular?language=en-US&page=1')
export const getTopRated = () => tmdbFetch<TMDBMovieResponse>('/movie/top_rated?language=en-US&page=1')
export const getNowPlaying = () => tmdbFetch<TMDBMovieResponse>('/movie/now_playing?language=en-US&page=1')
export const getUpcoming = () => tmdbFetch<TMDBMovieResponse>('/movie/upcoming?language=en-US&page=1')
export const getPopularTV = () => tmdbFetch<TMDBMovieResponse>('/tv/popular?language=en-US&page=1')
export const getTopRatedTV = () => tmdbFetch<TMDBMovieResponse>('/tv/top_rated?language=en-US&page=1')
export const getOnTheAirTV = () => tmdbFetch<TMDBMovieResponse>('/tv/on_the_air?language=en-US&page=1')

// Anime (Japanese origin TV shows)
export const getAnime = () => tmdbFetch<TMDBMovieResponse>('/discover/tv?language=en-US&page=1&with_genres=16&with_origin_country=JP&sort_by=popularity.desc')

// Detail pages
export const getMovieDetail = (id: string) => tmdbFetch<TMDBMovieDetail>(`/movie/${id}?append_to_response=credits,videos,images&language=en-US`)
export const getTVDetail = (id: string) => tmdbFetch<TMDBMovieDetail>(`/tv/${id}?append_to_response=credits,videos,images&language=en-US`)

// TV Seasons
export const getTVSeason = (id: string, season: number) => 
  tmdbFetch<any>(`/tv/${id}/season/${season}?language=en-US&append_to_response=credits`)

// Search
export const searchTMDB = (query: string, page = 1) => 
  tmdbFetch<TMDBSearchResponse>(`/search/multi?language=en-US&page=${page}&query=${encodeURIComponent(query)}`)

// Genre mapping
export const GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // TV Genres
  10759: 'Action & Adventure',
  10762: 'Kids',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
}

export const getGenreNames = (ids: number[]): string[] => 
  ids.map(id => GENRES[id] || 'Unknown').filter(Boolean)

interface TMDBMovieResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}
