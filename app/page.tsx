// app/page.tsx
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ContentRow from './components/ContentRow'
import SportsRow from './components/SportsRow'
import Footer from './components/Footer'
import { 
  getTrending, 
  getPopularMovies, 
  getTopRated, 
  getPopularTV, 
  getAnime, 
  getNowPlaying,
  poster,
  backdrop,
  TMDBMovie,
} from '@/lib/tmdb'

const transformMovie = (m: TMDBMovie) => ({
  id: String(m.id),
  title: m.title || '',
  seed: String(m.id),
  rating: m.vote_average || 0,
  year: m.release_date ? parseInt(String(m.release_date).split('-')[0]) : 2024,
  genre: [],
  poster: poster(m.poster_path),
  backdrop: backdrop(m.backdrop_path),
  type: 'movie' as const,
  description: m.overview || '',
})

export default async function HomePage() {
  // Try to fetch from TMDB
  let tmdbData: any = null
  let tmdbError = false

  try {
    const [trending, popular, topRated, anime, nowPlaying] = await Promise.all([
      getTrending(),
      getPopularMovies(),
      getTopRated(),
      getAnime(),
      getNowPlaying(),
    ])
    tmdbData = { trending, popular, topRated, anime, nowPlaying }
  } catch (e) {
    console.error('TMDB Error:', e)
    tmdbError = true
  }

  // If TMDB failed, show error message
  if (tmdbError || !tmdbData) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: 0 }}>
          <HeroSection />
          <div style={{ padding: '60px', textAlign: 'center', color: '#fff' }}>
            <h2 style={{ color: 'var(--accent)' }}>Unable to load content</h2>
            <p style={{ color: 'var(--muted)' }}>Please check TMDB API configuration</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 0 }}>
        <HeroSection />
        
        <ContentRow
          title={<>🔥 Trending This Week</>}
          items={tmdbData.trending.results.slice(0, 10).map(transformMovie)}
          tabs={['All', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Comedy']}
        />

        <ContentRow
          title={<>⭐ Top Rated</>}
          items={tmdbData.topRated.results.slice(0, 10).map(transformMovie)}
          cardSize="md"
          showRank
          pill="UPDATED DAILY"
        />

        <ContentRow
          title={<>📺 Popular Movies</>}
          items={tmdbData.popular.results.slice(0, 10).map(transformMovie)}
        />

        <ContentRow
          title={<>🆕 Now Playing</>}
          items={tmdbData.nowPlaying.results.slice(0, 10).map(transformMovie)}
          pill="FRESH"
        />

        <ContentRow
          title={<>⛩ Anime</>}
          items={tmdbData.anime.results.slice(0, 10).map(transformMovie)}
          tabs={['Popular', 'New Season', 'Action', 'Romance', 'Fantasy']}
        />

        <SportsRow />
      </main>
      <Footer />
    </>
  )
}
