import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import LearningManager from '../components/LearningManager'
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
const [mySubmissions, setMySubmissions] = useState([])
const [loadingSubmissions, setLoadingSubmissions] = useState(true)

const [reviewArticles, setReviewArticles] = useState([])
const [loadingReviewArticles, setLoadingReviewArticles] = useState(false)
const [publishingArticleId, setPublishingArticleId] = useState(null)
const [deletingArticleId, setDeletingArticleId] = useState(null)
const [editingArticle, setEditingArticle] = useState(null)
const [editTitle, setEditTitle] = useState('')
const [editBody, setEditBody] = useState('')
const [savingArticleEdit, setSavingArticleEdit] = useState(false)
const [reviewMessage, setReviewMessage] = useState('')
const [reviewError, setReviewError] = useState(false)
  const [articleTitle, setArticleTitle] = useState('')
  const [articleBody, setArticleBody] = useState('')
  const [submittingArticle, setSubmittingArticle] = useState(false)
  const [articleMessage, setArticleMessage] = useState('')
  const [articleError, setArticleError] = useState(false)
const [mediaTitle, setMediaTitle] = useState('')
const [mediaDescription, setMediaDescription] = useState('')
const [mediaFile, setMediaFile] = useState(null)
const [uploadingMedia, setUploadingMedia] = useState(false)
const [mediaMessage, setMediaMessage] = useState('')
const [mediaError, setMediaError] = useState(false)

const [adminMedia, setAdminMedia] = useState([])
const [loadingAdminMedia, setLoadingAdminMedia] = useState(false)
const [publishingMediaId, setPublishingMediaId] = useState(null)
const [deletingMediaId, setDeletingMediaId] = useState(null)
const [adminMediaMessage, setAdminMediaMessage] = useState('')
const [adminMediaError, setAdminMediaError] = useState(false)

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
        try {
  const submissionsData = await api.getMyContent()

  if (!active) return

  setMySubmissions(
    Array.isArray(submissionsData)
      ? submissionsData
      : submissionsData.content || submissionsData.data || []
  )
} catch (err) {
  if (!active) return

  setArticleMessage(
    err.message || 'Could not load your article submissions.'
  )
  setArticleError(true)
} finally {
  if (active) setLoadingSubmissions(false)
}

if (verifiedUser.role === 'admin') {
  setLoadingReviewArticles(true)

  try {
    const reviewData = await api.getAdminContent()

    if (!active) return

    setReviewArticles(
      Array.isArray(reviewData)
        ? reviewData
        : reviewData.content || reviewData.data || []
    )
  } catch (err) {
    if (!active) return

    setReviewMessage(
      err.message || 'Could not load articles awaiting review.'
    )
    setReviewError(true)
  } finally {
    if (active) setLoadingReviewArticles(false)
  }
}
if (verifiedUser.role === 'admin') {
  setLoadingAdminMedia(true)

  try {
    const adminMediaData = await api.getAdminMedia()

    if (!active) return

    setAdminMedia(
      Array.isArray(adminMediaData)
        ? adminMediaData
        : adminMediaData.media || adminMediaData.data || []
    )
  } catch (adminErr) {
    if (!active) return

    setAdminMediaMessage(
      adminErr.message || 'Could not load the administrator media library.'
    )
    setAdminMediaError(true)
  } finally {
    if (active) {
      setLoadingAdminMedia(false)
    }
  }
}

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
async function refreshMySubmissions() {
  setLoadingSubmissions(true)

  try {
    const result = await api.getMyContent()
    setMySubmissions(
      Array.isArray(result)
        ? result
        : result.content || result.data || []
    )
  } catch (err) {
    setArticleMessage(
      err.message || 'Could not load your article submissions.'
    )
    setArticleError(true)
  } finally {
    setLoadingSubmissions(false)
  }
}

async function refreshArticlesForReview() {
  setLoadingReviewArticles(true)
  setReviewMessage('')
  setReviewError(false)

  try {
    const result = await api.getAdminContent()

    setReviewArticles(
      Array.isArray(result)
        ? result
        : result.content || result.data || []
    )
  } catch (err) {
    setReviewMessage(
      err.message || 'Could not load articles awaiting review.'
    )
    setReviewError(true)
  } finally {
    setLoadingReviewArticles(false)
  }
}

async function handleArticlePublication(item) {
  setPublishingArticleId(item.id)
  setReviewMessage('')
  setReviewError(false)

  try {
    await api.updateContent(item.id, { status: 'published' })

    await Promise.all([
      refreshArticlesForReview(),
      refreshMySubmissions(),
    ])

    const publishedContent = await api.getContent()

    setContent(
      Array.isArray(publishedContent)
        ? publishedContent
        : publishedContent.content || publishedContent.data || []
    )

    setReviewMessage(`"${item.title}" has been published successfully.`)
  } catch (err) {
    setReviewMessage(
      err.message || 'Could not publish this article.'
    )
    setReviewError(true)
  } finally {
    setPublishingArticleId(null)
  }
}

function startArticleEdit(item) {
  setEditingArticle(item)
  setEditTitle(item.title || '')
  setEditBody(item.body || '')
}

async function handleArticleEdit(event) {
  event.preventDefault()
  if (!editingArticle || !editTitle.trim() || !editBody.trim()) return

  setSavingArticleEdit(true)
  setReviewMessage('')
  setReviewError(false)

  try {
    await api.updateContent(editingArticle.id, {
      title: editTitle.trim(),
      body: editBody.trim(),
    })
    await Promise.all([refreshArticlesForReview(), refreshMySubmissions()])
    setEditingArticle(null)
    setReviewMessage('Article changes saved successfully.')
  } catch (err) {
    setReviewMessage(err.message || 'Could not save article changes.')
    setReviewError(true)
  } finally {
    setSavingArticleEdit(false)
  }
}

async function handleArticleDeletion(item) {
  const confirmed = window.confirm(
    `Delete "${item.title}" permanently from LegacyEducation? This action cannot be undone.`
  )
  if (!confirmed) return

  setDeletingArticleId(item.id)
  setReviewMessage('')
  setReviewError(false)

  try {
    await api.deleteContent(item.id)
    await Promise.all([refreshArticlesForReview(), refreshMySubmissions()])
    setContent((current) => current.filter((article) => article.id !== item.id))
    setReviewMessage('Article deleted successfully.')
  } catch (err) {
    setReviewMessage(err.message || 'Could not delete this article.')
    setReviewError(true)
  } finally {
    setDeletingArticleId(null)
  }
}
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

setArticleError(false)

try {
  const result = await api.getMyContent()

  setMySubmissions(
    Array.isArray(result)
      ? result
      : result.content || result.data || []
  )
} catch (err) {
  setArticleMessage(
    'Your article was submitted, but the submission list could not refresh.'
  )
}
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

  async function handleMediaUpload(event) {
    event.preventDefault()

    setMediaMessage('')
    setMediaError(false)

    if (!mediaTitle.trim() || !mediaFile) {
      setMediaMessage('Please enter a title and select a file.')
      setMediaError(true)
      return
    }

    const formData = new FormData()
    formData.append('title', mediaTitle.trim())
    formData.append('description', mediaDescription.trim())
    formData.append('file', mediaFile)

    setUploadingMedia(true)

    try {
      const result = await api.uploadMedia(formData)

      setMediaMessage(
        result.message || 'File uploaded successfully.'
      )
      setMediaTitle('')
      setMediaDescription('')
      setMediaFile(null)

      const updatedMedia = await api.getMedia()
      setMedia(
        Array.isArray(updatedMedia)
          ? updatedMedia
          : updatedMedia.media || updatedMedia.data || []
      )

      event.target.reset()
    } catch (err) {
      setMediaError(true)
      setMediaMessage(
        err.message || 'Upload failed. Please try again.'
      )
    } finally {
      setUploadingMedia(false)
    }
  }




  async function handleMediaPublication(item) {
    const nextStatus =
      item.status === 'published' ? 'draft' : 'published'

    setPublishingMediaId(item.id)
    setAdminMediaMessage('')
    setAdminMediaError(false)

    try {
      await api.updateMedia(item.id, { status: nextStatus })

      const updatedAdminMedia = await api.getAdminMedia()
      const updatedPublicMedia = await api.getMedia()

      setAdminMedia(
        Array.isArray(updatedAdminMedia)
          ? updatedAdminMedia
          : updatedAdminMedia.media || updatedAdminMedia.data || []
      )

      setMedia(
        Array.isArray(updatedPublicMedia)
          ? updatedPublicMedia
          : updatedPublicMedia.media || updatedPublicMedia.data || []
      )

      setAdminMediaMessage(
        nextStatus === 'published'
          ? 'Media published successfully.'
          : 'Media moved back to drafts.'
      )
    } catch (err) {
      setAdminMediaMessage(
        err.message || 'Could not update media publication status.'
      )
      setAdminMediaError(true)
    } finally {
      setPublishingMediaId(null)
    }
  }

async function handleMediaDeletion(item) {
  const confirmed = window.confirm(
    `Delete "${item.title}" from the LegacyEducation media library? This removes its database record but does not delete the Cloudinary file.`
  )

  if (!confirmed) return

  setDeletingMediaId(item.id)
  setAdminMediaMessage('')
  setAdminMediaError(false)

  try {
    await api.deleteMedia(item.id)

    const updatedAdminMedia = await api.getAdminMedia()
    const updatedPublicMedia = await api.getMedia()

    setAdminMedia(
      Array.isArray(updatedAdminMedia)
        ? updatedAdminMedia
        : updatedAdminMedia.media || updatedAdminMedia.data || []
    )

    setMedia(
      Array.isArray(updatedPublicMedia)
        ? updatedPublicMedia
        : updatedPublicMedia.media || updatedPublicMedia.data || []
    )

    setAdminMediaMessage('Media record deleted successfully.')
  } catch (err) {
    setAdminMediaMessage(
      err.message || 'Could not delete this media record.'
    )
    setAdminMediaError(true)
  } finally {
    setDeletingMediaId(null)
  }
}

  function handleLogout() {
    localStorage.removeItem('legacyeducation_token')
    localStorage.removeItem('legacyeducation_user')
    navigate('/login', { replace: true })
  }

  if (checking) {
    return (
      <main className="dashboard-page dashboard-loading">
        <div className="dashboard-loading-mark">LE</div>
        <p>Preparing your creative workspace...</p>
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

      <nav className="dashboard-quick-nav" aria-label="Dashboard sections">
        <a href="#modules">Learning</a>
        <a href="#stories">Stories</a>
        <a href="#my-submissions">My submissions</a>
        <a href="#submit-article">Submit work</a>
        <a href="#creative-media">Media</a>
        {user.role === 'admin' && <a href="#article-review">Administration</a>}
      </nav>

      <section className="dashboard-overview" aria-label="Your workspace overview">
        <article><span>Learning modules</span><strong>{learningModules.length}</strong></article>
        <article><span>Published stories</span><strong>{content.length}</strong></article>
        <article><span>Your submissions</span><strong>{mySubmissions.length}</strong></article>
        <article><span>Creative media</span><strong>{media.length}</strong></article>
      </section>

      {/* LEARNING MODULES */}

      {['admin', 'teacher'].includes(user.role) && (
        <LearningManager onModulesChanged={async () => {
          const result = await api.getLearningModules()
          setLearningModules(Array.isArray(result) ? result : result.modules || result.data || [])
        }} />
      )}


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

      <section id="stories" className="dashboard-section">
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
{/* MY ARTICLE SUBMISSIONS */}

<section id="my-submissions" className="dashboard-section">
  <div className="dashboard-section-heading">
    <p className="eyebrow">YOUR CREATIVE WORK</p>
    <h2>My Submissions</h2>
    <p>Track the articles you have shared with LegacyEducation.</p>
  </div>

  {loadingSubmissions ? (
    <p>Loading your submissions...</p>
  ) : mySubmissions.length === 0 ? (
    <p>You have not submitted any articles yet.</p>
  ) : (
    <div className="dashboard-list">
      {mySubmissions.map((item) => (
        <article className="dashboard-item" key={item.id}>
          <p className="dashboard-item-type">
            {(item.content_type || 'article').toUpperCase()}
          </p>

          <h3>{item.title}</h3>

          <p>
            Status: <strong>{item.status || 'draft'}</strong>
          </p>

          {item.body && (
            <p>
              {item.body.length > 180
                ? `${item.body.substring(0, 180)}...`
                : item.body}
            </p>
          )}
        </article>
      ))}
    </div>
  )}
</section>
{/* ADMIN ARTICLE REVIEW */}

{user.role === 'admin' && (
  <section id="article-review" className="dashboard-section">
    <div className="dashboard-section-heading">
      <p className="eyebrow">EDITORIAL WORKSPACE</p>
      <h2>Article Review</h2>
      <p>Review submitted articles before making them public.</p>
    </div>

    {reviewMessage && (
      <p
        role={reviewError ? 'alert' : 'status'}
        aria-live="polite"
      >
        {reviewMessage}
      </p>
    )}

    {loadingReviewArticles ? (
      <p>Loading articles awaiting review...</p>
    ) : reviewArticles.length === 0 ? (
      <p>No articles are awaiting review.</p>
    ) : (
      <div className="dashboard-list">
        {reviewArticles.map((item) => (
          <article className="dashboard-item" key={item.id}>
            <p className="dashboard-item-type">ARTICLE</p>

            <h3>{item.title}</h3>

            {item.author_name && (
              <p>Submitted by {item.author_name}</p>
            )}

            <p>
              {item.body}
            </p>

            <p>
              Status: <strong>{item.status}</strong>
            </p>

            <div className="dashboard-card-actions">
              <button
                className="dashboard-button dashboard-button-primary"
                type="button"
                disabled={publishingArticleId === item.id || deletingArticleId === item.id}
                onClick={() => handleArticlePublication(item)}
              >
                {publishingArticleId === item.id ? 'Publishing...' : 'Publish'}
              </button>
              <button
                className="dashboard-button dashboard-button-secondary"
                type="button"
                disabled={deletingArticleId === item.id || publishingArticleId === item.id}
                onClick={() => startArticleEdit(item)}
              >
                Edit
              </button>
              <button
                className="dashboard-button dashboard-button-danger"
                type="button"
                disabled={deletingArticleId === item.id || publishingArticleId === item.id}
                onClick={() => handleArticleDeletion(item)}
              >
                {deletingArticleId === item.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
)}
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

<section id="creative-media" className="dashboard-section">
  <div className="dashboard-section-heading">
    <p className="eyebrow">CONTRIBUTE</p>
    <h2>Upload Media</h2>
  </div>

  <form
    className="dashboard-article-form"
    onSubmit={handleMediaUpload}
  >
    <label htmlFor="media-title">Media title</label>
    <input
      id="media-title"
      type="text"
      value={mediaTitle}
      onChange={(event) => setMediaTitle(event.target.value)}
      required
    />

    <label htmlFor="media-description">Description (optional)</label>
    <textarea
      id="media-description"
      value={mediaDescription}
      onChange={(event) => setMediaDescription(event.target.value)}
      rows={3}
    />

    <label htmlFor="media-file">Choose a file</label>
    <input
      id="media-file"
      type="file"
      accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx,.ppt,.pptx"
      onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
      required
    />

    <button type="submit" disabled={uploadingMedia}>
      {uploadingMedia ? 'Uploading...' : 'Upload Media'}
    </button>

    {mediaMessage && (
      <p role="status" aria-live="polite">
        {mediaMessage}
      </p>
    )}
  </form>
</section>

{user.role === 'admin' && (
  <section className="dashboard-section">
    <div className="dashboard-section-heading">
      <p className="eyebrow">ADMINISTRATION</p>
      <h2>Media Library</h2>
      <p>Review uploaded files and publish approved work.</p>
    </div>

    {adminMediaMessage && (
      <p
        role="status"
        aria-live="polite"
        style={{ color: adminMediaError ? 'crimson' : 'green' }}
      >
        {adminMediaMessage}
      </p>
    )}

    {loadingAdminMedia ? (
      <p>Loading media library...</p>
    ) : adminMedia.length === 0 ? (
      <p>No uploaded files found.</p>
    ) : (
      <div className="dashboard-media-list">
        {adminMedia.map((item) => (
          <article key={item.id} className="dashboard-media-item">
            <h3>{item.title}</h3>

            {item.description && <p>{item.description}</p>}

            <p>
              Status: <strong>{item.status}</strong>
            </p>

            <p>Type: {item.media_type}</p>

            <a
              href={item.file_url}
              target="_blank"
              rel="noreferrer"
            >
              Open file
            </a>

            <button
              type="button"
              disabled={publishingMediaId === item.id}
              onClick={() => handleMediaPublication(item)}
            >
              {publishingMediaId === item.id
                ? 'Updating...'
                : item.status === 'published'
                  ? 'Unpublish'
                  : 'Publish'}
            </button>
<button
  type="button"
  disabled={
    publishingMediaId === item.id ||
    deletingMediaId === item.id
  }
  onClick={() => handleMediaDeletion(item)}
>
  {deletingMediaId === item.id ? 'Deleting...' : 'Delete'}
</button>

          </article>
        ))}
      </div>
    )}
  </section>
)}

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
    href={
      item.mime_type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      (item.original_name || item.filename || "").toLowerCase().endsWith(".docx")
        ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(item.file_url)}`
        : item.file_url
    }
    target="_blank"
    rel="noopener noreferrer"
  >
    {item.mime_type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ? "Preview document →"
      : "Open media →"}
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

      {editingArticle && (
        <div className="dashboard-modal-backdrop" role="presentation">
          <section
            className="dashboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-article-heading"
          >
            <div className="dashboard-modal-heading">
              <div>
                <p className="eyebrow">EDITORIAL WORKSPACE</p>
                <h2 id="edit-article-heading">Edit article</h2>
              </div>
              <button
                className="dashboard-modal-close"
                type="button"
                onClick={() => setEditingArticle(null)}
                aria-label="Close editor"
                disabled={savingArticleEdit}
              >
                ×
              </button>
            </div>
            <form className="dashboard-article-form" onSubmit={handleArticleEdit}>
              <label htmlFor="edit-article-title">Article title</label>
              <input
                id="edit-article-title"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                maxLength={200}
                required
                disabled={savingArticleEdit}
              />
              <label htmlFor="edit-article-body">Article content</label>
              <textarea
                id="edit-article-body"
                value={editBody}
                onChange={(event) => setEditBody(event.target.value)}
                rows={12}
                required
                disabled={savingArticleEdit}
              />
              <div className="dashboard-card-actions">
                <button className="dashboard-button dashboard-button-primary" type="submit" disabled={savingArticleEdit}>
                  {savingArticleEdit ? 'Saving...' : 'Save changes'}
                </button>
                <button className="dashboard-button dashboard-button-secondary" type="button" onClick={() => setEditingArticle(null)} disabled={savingArticleEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <footer className="dashboard-footer">
        Learn. Create. Share. Leave a legacy.
      </footer>
    </main>
  )
}

export default Dashboard