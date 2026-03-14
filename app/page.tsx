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

// Transform TMDB movie to ContentItem format
const transformMovie = (m: TMDBMovie) => ({
  id: String(m.id),
  title: m.title,
  seed: String(m.id),
  rating: m.vote_average || 0,
  year: m.release_date ? parseInt(m.release_date.split('-')[0]) : 2024,
  genre: [],
  poster: poster(m.poster_path),
  backdrop: backdrop(m.backdrop_path),
  type: 'movie' as const,
  description: m.overview || '',
})

export default async function HomePage() {
  try {
    const [trending, popular, topRated, anime, nowPlaying] = await Promise.all([
      getTrending(),
      getPopularMovies(),
      getTopRated(),
      getAnime(),
      getNowPlaying(),
    ])

    return (
      <>
        <Navbar />
        <main style={{ paddingTop: 0 }}>
          <HeroSection />
          
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

          <SportsRow />
        </main>
        <Footer />
      </>
    )
  } catch (error) {
    console.error('Failed to fetch from TMDB:', error)
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: 0 }}>
          <HeroSection />
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            <h2>Unable to load content</h2>
            <p>Please check your TMDB API key configuration.</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }
}
