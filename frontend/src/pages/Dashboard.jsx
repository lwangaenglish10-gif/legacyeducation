import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [content, setContent] = useState([])
  const [media, setMedia] = useState([])
  const [learningModules, setLearningModules] = useState([])
  const [checking, setChecking] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [error, setError] = useState('')

  const [articleTitle, setArticleTitle] = useState('')
  const [articleBody, setArticleBody] = useState('')
  const [submittingArticle, setSubmittingArticle] = useState(false)
  const [articleMessage, setArticleMessage] = useState('')
  const [articleError, setArticleError] = useState(false)

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

        const [
          contentData,
          mediaData,
          learningModulesData,
        ] = await Promise.all([
          api.getContent(),
          api.getMedia(),
          api.getLearningModules(),
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

        setLearningModules(
          Array.isArray(learningModulesData)
            ? learningModulesData
            : learningModulesData.modules ||
                learningModulesData.data ||
                []
        )
      } catch (err) {
        if (!active) return

        const message = err.message?.toLowerCase() || ''

        if (
          message.includes('token') ||
          message.includes('unauthorized') ||
          message.includes('authentication')
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

  async function handleArticleSubmit(event) {
    event.preventDefault()

    setArticleMessage('')
    setArticleError(false)

    if (!articleTitle.trim() || !articleBody.trim()) {
      setArticleMessage('Please enter both an article title and body.')
      setArticleError(true)
      return
    }

    setSubmittingArticle(true)

    try {
      await api.createContent({
        title: articleTitle.trim(),
        body: articleBody.trim(),
        content_type: 'article',
      })

      setArticleTitle('')
      setArticleBody('')
      setArticleMessage(
        'Your article has been submitted successfully for review.'
      )
    } catch (err) {
      setArticleError(true)
      setArticleMessage(
        err.message ||
          'Your article could not be submitted. Please try again.'
      )
    } finally {
      setSubmittingArticle(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('legacyeducation_token')
    localStorage.removeItem('legacyeducation_user')
    navigate('/login', { replace: true })
  }

  if (checking) {
    return (
      <main className="dashboard-page">
        <p>Verifying your login...</p>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link to="/" className="dashboard-brand">
          Legacy<span>Education</span>
        </Link>

        <div className="dashboard-header-actions">
          <span className="dashboard-user">
            {user.full_name || user.name || 'Student'}
          </span>

          <button
            className="dashboard-logout"
            type="button"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="dashboard-hero">
        <p className="eyebrow">YOUR CREATIVE JOURNEY</p>

        <h1>
          Welcome, {user.full_name || user.name || 'Student'}.
        </h1>

        <p>
          This is your space to learn, discover stories, explore creative
          work, and build something that leaves a legacy.
        </p>
      </section>

      {error && (
        <div className="auth-error" role="alert">
          {error}
        </div>
      )}

      {/* LEARNING MODULES */}

      <section id="modules" className="dashboard-section">
        <div className="dashboard-section-heading">
          <p className="eyebrow">LEARN & GROW</p>
          <h2>Learning Modules</h2>
        </div>

        {loadingContent ? (
          <p>Loading learning modules...</p>
        ) : learningModules.length === 0 ? (
          <p>No learning modules available yet.</p>
        ) : (
          <div className="dashboard-list">
            {learningModules.map((module) => (
              <article className="dashboard-item" key={module.id}>
                <p className="dashboard-item-type">
                  {module.level || 'LEARNING'}
                </p>

                <h3>{module.title}</h3>

                {module.description && (
                  <p>{module.description}</p>
                )}

                {module.creator_name && (
                  <small>
                    Created by {module.creator_name}
                  </small>
                )}

                <Link
                  to={`/modules/${module.id}`}
                  className="dashboard-module-button"
                >
                  Start module {'→'}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* STORIES & ARTICLES */}

      <section className="dashboard-section">
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
              <article className="dashboard-item" key={item.id}>
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
      </section>

      {/* SUBMIT AN ARTICLE */}

      <section id="submit-article" className="dashboard-section">
        <div className="dashboard-section-heading">
          <p className="eyebrow">SHARE YOUR CREATIVITY</p>
          <h2>Submit an Article</h2>
          <p>
            Share your ideas, experiences, knowledge, and creative work
            with the LegacyEducation community.
          </p>
        </div>

        <form
          className="dashboard-article-form"
          onSubmit={handleArticleSubmit}
        >
          <label htmlFor="article-title">Article title</label>

          <input
            id="article-title"
            type="text"
            value={articleTitle}
            onChange={(event) => setArticleTitle(event.target.value)}
            placeholder="Enter your article title"
            maxLength={200}
            required
            disabled={submittingArticle}
          />

          <label htmlFor="article-body">Your article</label>

          <textarea
            id="article-body"
            value={articleBody}
            onChange={(event) => setArticleBody(event.target.value)}
            placeholder="Write your article here..."
            rows={8}
            required
            disabled={submittingArticle}
          />

          <button type="submit" disabled={submittingArticle}>
            {submittingArticle ? 'Submitting...' : 'Submit for Review'}
          </button>

          {articleMessage && (
            <p
              role={articleError ? 'alert' : 'status'}
              aria-live="polite"
            >
              {articleMessage}
            </p>
          )}
        </form>
      </section>

      {/* MEDIA LIBRARY */}

      <section className="dashboard-section">
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
              <article className="dashboard-item" key={item.id}>
                <p className="dashboard-item-type">
                  {item.media_type || 'MEDIA'}
                </p>

                <h3>{item.title}</h3>

                {item.description && (
                  <p>{item.description}</p>
                )}

                {item.file_url && (
                  <a
                    href={api.mediaUrl(item.file_url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open media {'→'}
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="dashboard-actions">
        <Link to="/" className="button">
          Explore homepage {'→'}
        </Link>
      </div>

      <footer className="dashboard-footer">
        Learn. Create. Share. Leave a legacy.
      </footer>
    </main>
  )
}

export default Dashboard