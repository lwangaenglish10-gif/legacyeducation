import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './LearnerExperience.css'

function LearnerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState([])
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      if (!localStorage.getItem('legacyeducation_token')) {
        navigate('/login', { replace: true })
        return
      }
      try {
        const [me, moduleResult, progressResult, mediaResult] = await Promise.all([
          api.getMe(),
          api.getLearningModules(),
          api.getLessonProgress(),
          api.getMedia(),
        ])
        if (!active) return
        const currentUser = me.user || me
        setUser(currentUser)
        localStorage.setItem('legacyeducation_user', JSON.stringify(currentUser))
        setModules(moduleResult.modules || moduleResult.data || [])
        setProgress(progressResult.modules || [])
        const media = mediaResult.media || mediaResult.data || []
        setBooks(media.filter((item) =>
          item.mime_type === 'application/pdf' ||
          (item.media_type === 'document' && /\.pdf($|\?)/i.test(item.file_url || ''))
        ).slice(0, 3))
      } catch (err) {
        if (!active) return
        const message = (err.message || '').toLowerCase()
        if (message.includes('token') || message.includes('unauthorized') || message.includes('authentication')) {
          localStorage.removeItem('legacyeducation_token')
          localStorage.removeItem('legacyeducation_user')
          navigate('/login', { replace: true })
          return
        }
        setError(err.message || 'Your learning space could not be loaded.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [navigate])

  const progressByModule = useMemo(() => new Map(progress.map((item) => [String(item.module_id), item])), [progress])
  const completedLessons = progress.reduce((sum, item) => sum + Number(item.completed_lessons || 0), 0)
  const totalLessons = progress.reduce((sum, item) => sum + Number(item.total_lessons || 0), 0)
  const overall = totalLessons ? Math.round(completedLessons * 100 / totalLessons) : 0
  const nextModule = modules.find((item) => {
    const itemProgress = progressByModule.get(String(item.id))
    return !itemProgress || Number(itemProgress.progress_percentage) < 100
  }) || modules[0]

  if (loading) return <main className="learner-shell"><p className="learner-muted">Preparing your learning space…</p></main>

  return (
    <main className="learner-shell">
      <header className="learner-topbar">
        <Link className="learner-brand" to="/">Legacy<span>Education</span></Link>
        <nav aria-label="Learner navigation">
          <Link className="active" to="/learn">My learning</Link>
          <Link to="/library">Book library</Link>
          <Link to="/stories">Stories</Link>
        </nav>
        <button className="learner-signout" onClick={() => {
          localStorage.removeItem('legacyeducation_token')
          localStorage.removeItem('legacyeducation_user')
          navigate('/login', { replace: true })
        }}>Sign out</button>
      </header>

      <section className="learner-welcome">
        <div>
          <p className="learner-eyebrow">YOUR CREATIVE JOURNEY</p>
          <h1>Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}.</h1>
          <p>Pick up where you left off, discover a new skill or find something good to read.</p>
        </div>
        <div className="learner-welcome-mark" aria-hidden="true">LE<span>✳</span></div>
      </section>

      {error && <div className="learner-alert" role="alert">{error}</div>}

      <section className="learner-stats" aria-label="Your learning summary">
        <article><span>Available courses</span><strong>{modules.length}</strong><small>Published learning modules</small></article>
        <article><span>Lessons completed</span><strong>{completedLessons}</strong><small>Keep building your skills</small></article>
        <article><span>Overall progress</span><strong>{overall}%</strong><small>{totalLessons ? `${completedLessons} of ${totalLessons} lessons` : 'Your progress starts with your first lesson'}</small></article>
      </section>

      <section className="learner-section">
        <div className="learner-section-heading">
          <div><p className="learner-eyebrow">KEEP MOVING FORWARD</p><h2>Continue learning</h2></div>
          <Link to="/library">Explore the library ↗</Link>
        </div>
        {nextModule ? (
          <article className="learner-continue">
            <div className="learner-continue-copy">
              <span className="learner-pill">{nextModule.level || 'CREATIVE LEARNING'}</span>
              <h3>{nextModule.title}</h3>
              <p>{nextModule.description || 'Build practical knowledge through this learning module.'}</p>
              <Link className="learner-primary-button" to={`/modules/${nextModule.id}`}>Continue module <span>→</span></Link>
            </div>
            <div className="learner-progress-panel">
              <span>Your progress</span>
              <strong>{Number(progressByModule.get(String(nextModule.id))?.progress_percentage || 0)}%</strong>
              <div className="learner-progress-track"><i style={{ width: `${Number(progressByModule.get(String(nextModule.id))?.progress_percentage || 0)}%` }} /></div>
              <small>{Number(progressByModule.get(String(nextModule.id))?.completed_lessons || 0)} of {Number(progressByModule.get(String(nextModule.id))?.total_lessons || 0)} lessons completed</small>
            </div>
          </article>
        ) : (
          <div className="learner-empty"><h3>Your next learning chapter starts here.</h3><p>There are no published learning modules yet. Visit again soon to discover new courses.</p></div>
        )}
      </section>

      <section className="learner-section">
        <div className="learner-section-heading"><div><p className="learner-eyebrow">LEARN AT YOUR OWN PACE</p><h2>Your learning paths</h2></div></div>
        {modules.length ? <div className="learner-course-grid">
          {modules.map((item) => {
            const itemProgress = progressByModule.get(String(item.id))
            const percent = Number(itemProgress?.progress_percentage || 0)
            return <article className="learner-course-card" key={item.id}>
              <span className="learner-pill">{item.level || 'CREATIVE LEARNING'}</span>
              <h3>{item.title}</h3>
              <p>{item.description || 'Explore the lessons in this learning path.'}</p>
              <div className="learner-course-progress"><span>{percent}% complete</span><div className="learner-progress-track"><i style={{ width: `${percent}%` }} /></div></div>
              <Link to={`/modules/${item.id}`}>{percent ? 'Resume learning' : 'Start learning'} →</Link>
            </article>
          })}
        </div> : <p className="learner-muted">Published learning paths will appear here.</p>}
      </section>

      <section className="learner-section learner-books-section">
        <div className="learner-section-heading"><div><p className="learner-eyebrow">READ. REFLECT. GROW.</p><h2>From the book library</h2></div><Link to="/library">Browse all books ↗</Link></div>
        {books.length ? <div className="learner-book-grid">
          {books.map((book) => <article className="learner-book-card" key={book.id}>
            <div className="learner-book-cover"><span>LEGACY<br/>READS</span><i>✳</i></div>
            <div><span className="learner-pill">PDF BOOK</span><h3>{book.title}</h3><p>{book.description || 'A resource from the LegacyEducation reading collection.'}</p><Link to="/library">View in library →</Link></div>
          </article>)}
        </div> : <div className="learner-empty"><p>New reading resources are on their way.</p><Link to="/library">Visit the book library →</Link></div>}
      </section>

      <footer className="learner-footer"><Link to="/">Legacy<span>Education</span></Link><span>Learn. Create. Share. Leave a legacy.</span></footer>
    </main>
  )
}

export default LearnerDashboard
