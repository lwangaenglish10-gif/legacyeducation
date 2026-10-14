import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Auth.css'

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [content, setContent] = useState([])
  const [media, setMedia] = useState([])
  const [checking, setChecking] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      const token = localStorage.getItem('legacyeducation_token')

      if (!token) {
        navigate('/login', { replace: true })
        return
      }

      try {
        const userData = await api.getMe()

        if (!active) return

        const verifiedUser = userData.user || userData
        setUser(verifiedUser)

        localStorage.setItem(
          'legacyeducation_user',
          JSON.stringify(verifiedUser)
        )

        const [contentData, mediaData] = await Promise.all([
          api.getContent(),
          api.getMedia(),
        ])

        if (!active) return

        setContent(
          Array.isArray(contentData)
            ? contentData
            : contentData.content || contentData.data || []
        )

        setMedia(
          Array.isArray(mediaData)
            ? mediaData
            : mediaData.media || mediaData.data || []
        )
      } catch (err) {
        if (!active) return

        if (
          err.message?.toLowerCase().includes('token') ||
          err.message?.toLowerCase().includes('unauthorized') ||
          err.message?.toLowerCase().includes('authentication')
        ) {
          localStorage.removeItem('legacyeducation_token')
          localStorage.removeItem('legacyeducation_user')
          navigate('/login', { replace: true })
          return
        }

        setError(
          err.message ||
            'We could not load your dashboard content right now.'
        )
      } finally {
        if (active) {
          setChecking(false)
          setLoadingContent(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('legacyeducation_token')
    localStorage.removeItem('legacyeducation_user')
    navigate('/login', { replace: true })
  }

  if (checking) {
    return (
      <main className="auth-page">
        <p>Verifying your login...</p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-logo">
        Legacy<span>Education</span>
      </Link>

      <section className="auth-card">
        <p className="eyebrow">YOUR CREATIVE JOURNEY</p>

        <h1>
          Welcome{user.full_name ? `, ${user.full_name}` : ' back'}.
        </h1>

        <p className="auth-intro">
          Discover learning resources, stories, articles and creative media
          from the LegacyEducation community.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <div className="dashboard-section">
          <div className="dashboard-section-heading">
            <p className="eyebrow">LEARN & DISCOVER</p>
            <h2>Stories & Articles</h2>
          </div>

          {loadingContent ? (
            <p>Loading stories and articles...</p>
          ) : content.length === 0 ? (
            <p>No published stories or articles yet.</p>
          ) : (
            <div className="dashboard-list">
              {content.map((item) => (
                <article
                  className="dashboard-item"
                  key={item.id}
                >
                  <p className="dashboard-item-type">
                    {item.content_type || 'STORY'}
                  </p>

                  <h3>{item.title}</h3>

                  {item.body && (
                    <p>
                      {item.body.length > 180
                        ? `${item.body.substring(0, 180)}...`
                        : item.body}
                    </p>
                  )}

                  {item.author_name && (
                    <small>By {item.author_name}</small>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-heading">
            <p className="eyebrow">CREATIVE MEDIA</p>
            <h2>Media Library</h2>
          </div>

          {loadingContent ? (
            <p>Loading media...</p>
          ) : media.length === 0 ? (
            <p>No published media yet.</p>
          ) : (
            <div className="dashboard-list">
              {media.map((item) => (
                <article
                  className="dashboard-item"
                  key={item.id}
                >
                  <p className="dashboard-item-type">
                    {item.media_type || 'MEDIA'}
                  </p>

                  <h3>{item.title}</h3>

                  {item.description && (
                    <p>{item.description}</p>
                  )}

                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open media ↗
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <Link to="/" className="button">
            Explore homepage ↗
          </Link>

          <button
            className="button auth-submit"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </section>

      <p className="auth-footer">
        Learn. Create. Share. Leave a legacy.
      </p>
    </main>
  )
}

export default Dashboard