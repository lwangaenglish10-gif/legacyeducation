import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import './LearnerExperience.css'

function BookLibrary() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    let active = true
    api.getMedia().then((result) => {
      if (!active) return
      const media = result.media || result.data || []
      setBooks(media.filter((item) =>
        item.mime_type === 'application/pdf' ||
        (item.media_type === 'document' && /\.pdf($|\?)/i.test(item.file_url || ''))
      ))
    }).catch((err) => {
      if (active) setError(err.message || 'The book library could not be loaded.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return books
    return books.filter((book) => [book.title, book.description, book.uploaded_by_name].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [books, search])

  async function downloadBook(book) {
    setDownloading(book.id)
    try {
      const response = await fetch(api.mediaDownloadUrl(book.id), {
        headers: localStorage.getItem('legacyeducation_token')
          ? { Authorization: `Bearer ${localStorage.getItem('legacyeducation_token')}` }
          : {},
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.message || 'This book could not be downloaded.')
      }
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${(book.title || 'legacyeducation-book').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'legacyeducation-book'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      setError(err.message || 'Download failed. Please try again.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <main className="learner-shell">
      <header className="learner-topbar">
        <Link className="learner-brand" to="/">Legacy<span>Education</span></Link>
        <nav aria-label="Library navigation"><Link to="/learn">My learning</Link><Link className="active" to="/library">Book library</Link><Link to="/stories">Stories</Link></nav>
        <Link className="learner-signout-link" to="/login">Sign in</Link>
      </header>

      <section className="library-hero">
        <p className="learner-eyebrow">THE LEGACYEDUCATION READING ROOM</p>
        <h1>Good ideas deserve <span>good readers.</span></h1>
        <p>Explore books and learning resources selected for curious minds and creative people. Read, reflect and carry an idea into the world.</p>
        <label className="library-search">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search books by title or description…" aria-label="Search books"/>
        </label>
        <div className="library-count">{books.length} {books.length === 1 ? 'book' : 'books'} in the collection</div>
      </section>

      {error && <div className="learner-alert" role="alert">{error}</div>}
      <section className="learner-section library-results">
        <div className="learner-section-heading"><div><p className="learner-eyebrow">EXPLORE THE COLLECTION</p><h2>{search ? 'Search results' : 'The library'}</h2></div><Link to="/learn">Go to my learning ↗</Link></div>
        {loading ? <p className="learner-muted">Gathering books for you…</p> : filteredBooks.length ? (
          <div className="library-grid">
            {filteredBooks.map((book, index) => <article className="library-book" key={book.id}>
              <div className={`library-book-art library-book-art-${index % 4}`}><span>LEGACY<br/>EDUCATION</span><i>✳</i><small>READ · LEARN · CREATE</small></div>
              <div className="library-book-info"><span className="learner-pill">DIGITAL BOOK · PDF</span><h3>{book.title}</h3><p>{book.description || 'A reading resource from the LegacyEducation collection.'}</p><div className="library-book-actions"><button className="learner-primary-button" type="button" disabled={downloading === book.id} onClick={() => downloadBook(book)}>{downloading === book.id ? 'Preparing…' : 'Download PDF ↓'}</button><a href={api.mediaUrl(book.file_url)} target="_blank" rel="noreferrer">Preview ↗</a></div></div>
            </article>)}
          </div>
        ) : <div className="learner-empty"><h3>{search ? 'No books match that search.' : 'The reading room is being prepared.'}</h3><p>{search ? 'Try another title or a different search term.' : 'Published PDF books will appear here as the collection grows. Check back soon.'}</p>{search && <button className="learner-text-button" onClick={() => setSearch('')}>Clear search</button>}</div>}
      </section>
      <section className="library-invitation"><p className="learner-eyebrow">LEARNING IS A SHARED JOURNEY</p><h2>Read something. Make something. Share something.</h2><p>Join LegacyEducation and take your creative learning further.</p><Link className="learner-primary-button" to="/register">Join the community ↗</Link></section>
      <footer className="learner-footer"><Link to="/">Legacy<span>Education</span></Link><span>Learn. Create. Share. Leave a legacy.</span></footer>
    </main>
  )
}

export default BookLibrary
