// app/page.tsx
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ContentRow from './components/ContentRow'
import Footer from './components/Footer'
import { 
  getTrending, 
  getPopularMovies, 
  getTopRated, 
  getAnime, 
  getNowPlaying,
  poster,
  backdrop,
  TMDBMovie,
  getGenreNames,
} from '@/lib/tmdb'

interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  description?: string
  rating?: number
  year?: number
  runtime?: string
  pg?: string
  tags?: string[]
  poster?: string | null
  backdrop?: string | null
}

const transformMovie = (m: TMDBMovie) => ({
  id: String(m.id),
  title: m.title || '',
  seed: String(m.id),
  rating: m.vote_average || 0,
  year: m.release_date ? parseInt(String(m.release_date).split('-')[0]) : 2024,
  genre: getGenreNames(m.genre_ids ?? []),
  poster: poster(m.poster_path),
  backdrop: backdrop(m.backdrop_path),
  type: 'movie' as const,
  description: m.overview || '',
})

const transformHero = (m: TMDBMovie): HeroSlide => ({
  id: String(m.id),
  title: m.title || '',
  description: m.overview || '',
  rating: m.vote_average || 0,
  year: m.release_date ? parseInt(String(m.release_date).split('-')[0]) : undefined,
  tags: getGenreNames(m.genre_ids ?? []).slice(0, 4),
  poster: poster(m.poster_path),
  backdrop: backdrop(m.backdrop_path),
})

export default async function HomePage() {
  const [trending, popular, topRated, anime, nowPlaying] = await Promise.all([
    getTrending(),
    getPopularMovies(),
    getTopRated(),
    getAnime(),
    getNowPlaying(),
  ])

  const heroSlides = trending.results.slice(0, 4).map(transformHero)

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 0 }}>
        <HeroSection slides={heroSlides} />
        
        <ContentRow
          title={<>🔥 Trending This Week</>}
          items={trending.results.slice(0, 10).map(transformMovie)}
          tabs={['All', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Comedy']}
        />

        <ContentRow
          title={<>⭐ Top Rated</>}
          items={topRated.results.slice(0, 10).map(transformMovie)}
          cardSize="md"
          showRank
          pill="UPDATED DAILY"
        />

        <ContentRow
          title={<>📺 Popular Movies</>}
          items={popular.results.slice(0, 10).map(transformMovie)}
        />

        <ContentRow
          title={<>🆕 Now Playing</>}
          items={nowPlaying.results.slice(0, 10).map(transformMovie)}
          pill="FRESH"
        />

        <ContentRow
          title={<>⛩ Anime</>}
          items={anime.results.slice(0, 10).map(transformMovie)}
          tabs={['Popular', 'New Season', 'Action', 'Romance', 'Fantasy']}
        />
      </main>
      <Footer />
    </>
  )
}
