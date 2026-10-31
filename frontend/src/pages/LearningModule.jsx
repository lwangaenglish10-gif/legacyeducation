import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

function LearningModule() {
  const { moduleId } = useParams()
  const [module, setModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completedIds, setCompletedIds] = useState([])
  const [completingId, setCompletingId] = useState(null)
  const [progressMessage, setProgressMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadModule() {
      try {
        setLoading(true)
        setError('')

        const requests = [api.getLearningModule(moduleId), api.getLessons(moduleId)]
        if (localStorage.getItem('legacyeducation_token')) requests.push(api.getCompletedLessons())
        const [moduleResponse, lessonResponse, completedResponse] = await Promise.all(requests)

        const lessonItems = Array.isArray(lessonResponse)
          ? lessonResponse
          : lessonResponse.lessons || []

        if (active) {
          setModule(moduleResponse.module || moduleResponse)
          setLessons(lessonItems)
          setCompletedIds((completedResponse?.lessons || []).map((item) => Number(item.lesson_id)))
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load this module.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadModule()

    return () => {
      active = false
    }
  }, [moduleId])

  async function markComplete(lessonId) {
    setCompletingId(lessonId)
    setProgressMessage('')
    try {
      await api.completeLesson(lessonId)
      setCompletedIds((current) => current.includes(Number(lessonId)) ? current : [...current, Number(lessonId)])
      setProgressMessage('Your lesson progress has been saved.')
    } catch (err) {
      setProgressMessage(err.message || 'Could not save lesson progress.')
    } finally {
      setCompletingId(null)
    }
  }

  if (loading) return <main className="learning-module-page"><p>Loading module...</p></main>

  if (error) {
    return (
      <main className="learning-module-page">
        <h1>Unable to load module</h1>
        <p>{error}</p>
        <Link to="/dashboard">Back to dashboard</Link>
      </main>
    )
  }

  if (!module) {
    return (
      <main className="learning-module-page">
        <h1>Module not found</h1>
        <Link to="/dashboard">Back to dashboard</Link>
      </main>
    )
  }

  return (
    <main
      className="learning-module-page"
      style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}
    >
      <Link to="/dashboard">Back to dashboard</Link>

      <header style={{ margin: '28px 0' }}>
        <p>LEGACYEDUCATION LEARNING</p>
        <h1>{module.title}</h1>
        <p>{module.description}</p>
        <p>Level: {module.level || 'Beginner'}</p>
      </header>

      <section>
        <h2>Lessons</h2>
        {progressMessage && <p role="status">{progressMessage}</p>}

        {lessons.length === 0 ? (
          <p>No published lessons are available yet.</p>
        ) : (
          lessons.map((lesson, index) => (
            <article
              key={lesson.id}
              style={{
                padding: 24,
                marginBottom: 20,
                border: '1px solid #ddd',
                borderRadius: 12,
              }}
            >
              <p>LESSON {lesson.lesson_order || index + 1}</p>
              <h3>{lesson.title}</h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {lesson.content}
              </p>
              {localStorage.getItem('legacyeducation_token') && (
                completedIds.includes(Number(lesson.id)) ? (
                  <p aria-label="Lesson completed" style={{ color: '#416a4e', fontWeight: 700 }}>✓ Completed</p>
                ) : (
                  <button type="button" disabled={completingId === lesson.id} onClick={() => markComplete(lesson.id)}>
                    {completingId === lesson.id ? 'Saving progress…' : 'Mark lesson complete'}
                  </button>
                )
              )}
            </article>
          ))
        )}
      </section>
    </main>
  )
}

export default LearningModule
