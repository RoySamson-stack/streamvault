// lib/data.ts
// All mock content data. Replace with Supabase queries later.

export interface ContentItem {
  id: string
  title: string
  seed?: string
  rating: number
  year: number
  genre: string[]
  poster?: string | null
  backdrop?: string | null
  description?: string | null
  badge?: string
  badgeColor?: 'red' | 'blue' | 'gold'
  progress?: number   // for Continue Watching (0-100)
  episode?: string
  type: 'movie' | 'series' | 'anime' | 'sport'
}

export interface SportEvent {
  id: string
  home: string
  away: string
  score: string
  league: string
  status: 'LIVE' | 'TODAY' | 'FT' | 'TOMORROW'
  seed: string
  sport: 'football' | 'basketball' | 'tennis' | 'f1' | 'mma'
}

export interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  description?: string
  seed?: string
  rating?: number
  year?: number
  runtime?: string
  pg?: string
  tags?: string[]
  poster?: string | null
  backdrop?: string | null
}

export const HERO_SLIDES = [
  {
    id: 'h1',
    title: 'DUNE',
    subtitle: 'PART TWO',
    description:
      'Paul Atreides unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    seed: 'movie1',
    rating: 8.9,
    year: 2024,
    runtime: '2h 46m',
    pg: 'PG-13',
    tags: ['Sci-Fi', 'Epic', 'Adventure', 'Drama'],
  },
  {
    id: 'h2',
    title: 'OPPENHEIMER',
    subtitle: '',
    description:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    seed: 'movie22',
    rating: 8.3,
    year: 2023,
    runtime: '3h 0m',
    pg: 'R',
    tags: ['History', 'Drama', 'Thriller', 'Biographical'],
  },
  {
    id: 'h3',
    title: 'THE BATMAN',
    subtitle: 'RETURNS',
    description:
      "Batman faces a new wave of enemies rising from Gotham's underbelly in this gritty, psychological take on the Dark Knight.",
    seed: 'movie3',
    rating: 7.8,
    year: 2024,
    runtime: '2h 55m',
    pg: 'PG-13',
    tags: ['Action', 'Crime', 'Mystery'],
  },
  {
    id: 'h4',
    title: 'AVATAR',
    subtitle: 'THE NEXT',
    description:
      'Jake Sully and Neytiri face an unprecedented threat to Pandora as ancient forces awaken across the world-forest.',
    seed: 'movie44',
    rating: 7.6,
    year: 2025,
    runtime: '3h 10m',
    pg: 'PG-13',
    tags: ['Sci-Fi', 'Fantasy', 'Adventure'],
  },
]

export const CONTINUE_WATCHING: ContentItem[] = [
  { id: 'cw1', title: 'The Watcher', seed: 'show11', rating: 8.1, year: 2024, genre: ['Thriller'], progress: 58, episode: 'S2 E4 · 32 min left', type: 'series' },
  { id: 'cw2', title: 'Inception 2', seed: 'film10', rating: 8.7, year: 2024, genre: ['Sci-Fi'], progress: 35, episode: '1h 12m left', type: 'movie' },
  { id: 'cw3', title: 'Solo Leveling', seed: 'anime10', rating: 9.0, year: 2024, genre: ['Anime'], progress: 82, episode: 'S1 E11 · 8 min left', type: 'anime' },
  { id: 'cw4', title: 'Broken Crown', seed: 'show33', rating: 7.9, year: 2023, genre: ['Drama'], progress: 22, episode: 'S1 E7 · 42 min left', type: 'series' },
  { id: 'cw5', title: 'Shadowfall', seed: 'film30', rating: 7.5, year: 2024, genre: ['Action'], progress: 47, episode: '54 min left', type: 'movie' },
]

export const TRENDING_MOVIES: ContentItem[] = [
  { id: 'm1', title: 'Inception 2', seed: 'film10', rating: 8.7, year: 2024, genre: ['Sci-Fi'], type: 'movie' },
  { id: 'm2', title: 'The Last Horizon', seed: 'film20', rating: 7.9, year: 2024, genre: ['Drama'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
  { id: 'm3', title: 'Shadowfall', seed: 'film30', rating: 7.5, year: 2023, genre: ['Action'], type: 'movie' },
  { id: 'm4', title: 'Neon Dynasty', seed: 'film40', rating: 8.2, year: 2024, genre: ['Cyberpunk'], badge: '4K', badgeColor: 'gold', type: 'movie' },
  { id: 'm5', title: 'Crimson Tide 2', seed: 'film50', rating: 7.8, year: 2024, genre: ['Thriller'], type: 'movie' },
  { id: 'm6', title: 'Eclipse Rising', seed: 'film60', rating: 8.0, year: 2025, genre: ['Sci-Fi'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
  { id: 'm7', title: 'Void Runner', seed: 'film70', rating: 7.3, year: 2023, genre: ['Action'], type: 'movie' },
  { id: 'm8', title: 'Dark Parallels', seed: 'film80', rating: 8.5, year: 2025, genre: ['Mystery'], badge: 'HDR', badgeColor: 'gold', type: 'movie' },
  { id: 'm9', title: 'Phantom City', seed: 'film90', rating: 7.6, year: 2024, genre: ['Noir'], type: 'movie' },
  { id: 'm10', title: 'Storm Protocol', seed: 'film100', rating: 8.1, year: 2025, genre: ['War'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
]

export const TOP_10: ContentItem[] = TRENDING_MOVIES.slice(0, 10)

export const POPULAR_SERIES: ContentItem[] = [
  { id: 's1', title: 'The Watcher', seed: 'show11', rating: 8.1, year: 2024, genre: ['Thriller'], badge: 'NEW', badgeColor: 'blue', type: 'series' },
  { id: 's2', title: 'Broken Crown', seed: 'show22', rating: 8.6, year: 2023, genre: ['Drama'], type: 'series' },
  { id: 's3', title: 'Night Protocol', seed: 'show33', rating: 7.9, year: 2024, genre: ['Thriller'], badge: 'NEW', badgeColor: 'blue', type: 'series' },
  { id: 's4', title: 'The Syndicate', seed: 'show44', rating: 8.3, year: 2024, genre: ['Crime'], type: 'series' },
  { id: 's5', title: 'Eclipse Files', seed: 'show55', rating: 7.7, year: 2023, genre: ['Sci-Fi'], type: 'series' },
  { id: 's6', title: 'Dark Matter 2', seed: 'show66', rating: 9.0, year: 2025, genre: ['Sci-Fi'], badge: 'S2', badgeColor: 'red', type: 'series' },
  { id: 's7', title: 'Liminal Space', seed: 'show77', rating: 8.2, year: 2024, genre: ['Horror'], type: 'series' },
  { id: 's8', title: 'Northbound', seed: 'show88', rating: 7.5, year: 2024, genre: ['Drama'], type: 'series' },
  { id: 's9', title: 'Signal Lost', seed: 'show99', rating: 8.4, year: 2025, genre: ['Mystery'], badge: 'NEW', badgeColor: 'blue', type: 'series' },
  { id: 's10', title: 'The Reckoning', seed: 'show110', rating: 7.8, year: 2024, genre: ['Action'], type: 'series' },
]

export const SPORT_EVENTS: SportEvent[] = [
  { id: 'sp1', home: 'Man City', away: 'Real Madrid', score: '2 – 1', league: 'UEFA Champions League', status: 'LIVE', seed: 'sports10', sport: 'football' },
  { id: 'sp2', home: 'Lakers', away: 'Celtics', score: '98 – 95', league: 'NBA · Q4 2:34', status: 'LIVE', seed: 'sports20', sport: 'basketball' },
  { id: 'sp3', home: 'Sinner', away: 'Djokovic', score: '6-4  3-2', league: 'Wimbledon · SF', status: 'LIVE', seed: 'sports30', sport: 'tennis' },
  { id: 'sp4', home: 'Ferrari', away: 'Mercedes', score: 'P1 · P3', league: 'Monaco Grand Prix', status: 'TODAY', seed: 'sports40', sport: 'f1' },
  { id: 'sp5', home: 'PSG', away: 'Bayern Munich', score: '1 – 0', league: 'Champions League', status: 'FT', seed: 'sports50', sport: 'football' },
  { id: 'sp6', home: 'Jon Jones', away: 'Stipe Miocic', score: 'Main Event', league: 'UFC 310 · TOMORROW', status: 'TOMORROW', seed: 'sports60', sport: 'mma' },
]

export const ANIME_LIST: ContentItem[] = [
  { id: 'a1', title: 'Solo Leveling', seed: 'anime10', rating: 9.0, year: 2024, genre: ['Action', 'Fantasy'], badge: 'S2', badgeColor: 'red', episode: 'S2 E8', type: 'anime' },
  { id: 'a2', title: 'Demon Slayer', seed: 'anime20', rating: 8.7, year: 2024, genre: ['Action'], badge: 'MOVIE', badgeColor: 'gold', episode: 'Movie', type: 'anime' },
  { id: 'a3', title: 'Jujutsu Kaisen', seed: 'anime30', rating: 8.6, year: 2024, genre: ['Action'], badge: 'NEW', badgeColor: 'blue', episode: 'S4 Final', type: 'anime' },
  { id: 'a4', title: 'Attack on Titan', seed: 'anime40', rating: 9.1, year: 2023, genre: ['Drama', 'Action'], badge: 'FINAL', badgeColor: 'red', episode: 'S4 Finale', type: 'anime' },
  { id: 'a5', title: 'One Piece', seed: 'anime50', rating: 8.9, year: 2024, genre: ['Adventure'], badge: 'E1000+', badgeColor: 'gold', episode: 'Ongoing', type: 'anime' },
  { id: 'a6', title: 'Chainsaw Man', seed: 'anime60', rating: 8.2, year: 2024, genre: ['Horror', 'Action'], badge: 'S2', badgeColor: 'red', episode: 'S2 E7', type: 'anime' },
  { id: 'a7', title: 'Spy × Family', seed: 'anime70', rating: 8.4, year: 2024, genre: ['Comedy'], badge: 'NEW', badgeColor: 'blue', episode: 'S3 E12', type: 'anime' },
  { id: 'a8', title: 'My Hero Academia', seed: 'anime80', rating: 8.0, year: 2024, genre: ['Action'], badge: 'S7', badgeColor: 'red', episode: 'S7 E1', type: 'anime' },
  { id: 'a9', title: 'Tokyo Revengers', seed: 'anime90', rating: 7.8, year: 2024, genre: ['Action'], episode: 'S1 E26', type: 'anime' },
  { id: 'a10', title: 'Vinland Saga', seed: 'anime100', rating: 9.0, year: 2024, genre: ['Historical'], badge: 'S3', badgeColor: 'red', episode: 'S3 E1', type: 'anime' },
]

export const NEW_RELEASES: ContentItem[] = [
  { id: 'n1', title: 'Parallel Earth', seed: 'new11', rating: 7.9, year: 2025, genre: ['Sci-Fi'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
  { id: 'n2', title: 'Zero Hour', seed: 'new22', rating: 8.1, year: 2025, genre: ['Thriller'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
  { id: 'n3', title: 'The Expanse 3', seed: 'new33', rating: 8.8, year: 2025, genre: ['Sci-Fi'], badge: 'NEW', badgeColor: 'blue', type: 'series' },
  { id: 'n4', title: 'Sable Wing', seed: 'new44', rating: 7.5, year: 2025, genre: ['Action'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
  { id: 'n5', title: 'Ghost Protocol 2', seed: 'new55', rating: 8.0, year: 2025, genre: ['Action'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
  { id: 'n6', title: 'Atlas Rising', seed: 'new66', rating: 7.7, year: 2025, genre: ['Drama'], badge: 'NEW', badgeColor: 'blue', type: 'series' },
  { id: 'n7', title: 'Broken Signal', seed: 'new77', rating: 8.3, year: 2025, genre: ['Mystery'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
  { id: 'n8', title: 'The Collapse', seed: 'new88', rating: 8.6, year: 2025, genre: ['Thriller'], badge: 'NEW', badgeColor: 'blue', type: 'movie' },
]
