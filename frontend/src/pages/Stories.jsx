
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import '../App.css'

function Stories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadStories() {
      try {
        const result = await api.getContent()

        const items = Array.isArray(result)
          ? result
          : result.content || result.articles || result.data || []

        if (active) {
          setStories(items.filter(
            (item) => !item.status || item.status === 'published'
          ))
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Stories could not be loaded.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStories()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="site">
      <header className="navbar">
        <Link className="logo" to="/">
          Legacy<span>Education</span>
        </Link>

        <nav aria-label="Stories navigation">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>

        <div className="nav-actions">
          <Link className="login-link" to="/login">Log in</Link>
          <Link className="button button-small" to="/register">
            Join the community
          </Link>
        </div>
      </header>

      <main className="section discover">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE LEGACYEDUCATION JOURNAL</p>
            <h1>Stories &amp; <span>Articles.</span></h1>
          </div>

          <p className="section-description">
            Discover perspectives, creative ideas and stories
            that inspire learning and meaningful change.
          </p>
        </div>

        {loading && <p role="status">Loading stories...</p>}

        {!loading && error && (
          <div role="alert">
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && stories.length === 0 && (
          <div className="feature-card">
            <h2>Your next favourite story starts here.</h2>
            <p>
              There are no published stories available yet.
              Check back soon or join LegacyEducation to get involved.
            </p>
            <Link className="button" to="/register">
              Join the community ↗
            </Link>
          </div>
        )}

        {!loading && !error && stories.length > 0 && (
          <div className="feature-grid">
            {stories.map((story) => (
              <article className="feature-card" key={story.id}>
                <p className="eyebrow">
                  {story.content_type || 'STORY'}
                </p>

                <h2>{story.title || 'Untitled story'}</h2>

                {story.author_name && (
                  <p>By {story.author_name}</p>
                )}

                <p>
                  {story.excerpt ||
                    story.body ||
                    story.content ||
                    story.text ||
                    'Explore this story from the LegacyEducation community.'}
                </p>
              </article>
            ))}
          </div>
        )}

        <p>
          <Link className="text-link" to="/">
            ← Back to home
          </Link>
        </p>
      </main>

      <footer className="footer">
        <Link className="logo" to="/">
          Legacy<span>Education</span>
        </Link>
        <p>Learn. Create. Share. Leave a legacy.</p>
      </footer>
    </div>
  )
}

export default Stories
