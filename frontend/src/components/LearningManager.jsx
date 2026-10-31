import { useEffect, useState } from 'react'
import api from '../services/api'

function LearningManager({ onModulesChanged }) {
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState('')
  const [moduleTitle, setModuleTitle] = useState('')
  const [moduleDescription, setModuleDescription] = useState('')
  const [moduleLevel, setModuleLevel] = useState('Beginner')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [lessonOrder, setLessonOrder] = useState('1')
  const [savingModule, setSavingModule] = useState(false)
  const [savingLesson, setSavingLesson] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  async function loadModules() {
    const result = await api.getLearningModules()
    const items = Array.isArray(result) ? result : result.modules || result.data || []
    setModules(items)
    if (!selectedModule && items.length) setSelectedModule(String(items[0].id))
  }

  useEffect(() => {
    loadModules().catch((error) => {
      setMessage(error.message || 'Could not load teaching modules.')
      setIsError(true)
    })
  }, [])

  async function handleCreateModule(event) {
    event.preventDefault()
    setSavingModule(true)
    setMessage('')
    setIsError(false)

    try {
      const result = await api.createLearningModule({
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        level: moduleLevel,
        is_published: true,
      })
      const created = result.module
      setModules((current) => [created, ...current.filter((item) => item.id !== created.id)])
      setSelectedModule(String(created.id))
      setModuleTitle('')
      setModuleDescription('')
      setMessage('Your learning module is live. You can now add its first lesson.')
      if (onModulesChanged) await onModulesChanged()
    } catch (error) {
      setMessage(error.message || 'Could not create the learning module.')
      setIsError(true)
    } finally {
      setSavingModule(false)
    }
  }

  async function handleCreateLesson(event) {
    event.preventDefault()
    if (!selectedModule) return
    setSavingLesson(true)
    setMessage('')
    setIsError(false)

    try {
      await api.createLesson({
        module_id: Number(selectedModule),
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        lesson_order: Number(lessonOrder) || 1,
        is_published: true,
      })
      setLessonTitle('')
      setLessonContent('')
      setLessonOrder(String(Number(lessonOrder) + 1))
      setMessage('Lesson published successfully. Learners can now access it inside the module.')
    } catch (error) {
      setMessage(error.message || 'Could not publish this lesson.')
      setIsError(true)
    } finally {
      setSavingLesson(false)
    }
  }

  return (
    <section className="learning-manager dashboard-section" aria-labelledby="learning-manager-title">
      <div className="dashboard-section-heading">
        <p className="eyebrow">TEACH & PUBLISH</p>
        <h2 id="learning-manager-title">Teaching workspace</h2>
        <p>Create a learning module, then add lessons that learners can open immediately.</p>
      </div>

      <div className="learning-manager-grid">
        <form className="learning-manager-card" onSubmit={handleCreateModule}>
          <h3>Create a module</h3>
          <label htmlFor="learning-module-title">Module title</label>
          <input id="learning-module-title" value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} maxLength={160} required placeholder="e.g. Introduction to Creative Writing" />
          <label htmlFor="learning-module-description">Short description</label>
          <textarea id="learning-module-description" value={moduleDescription} onChange={(event) => setModuleDescription(event.target.value)} rows={3} maxLength={1200} placeholder="What will learners gain from this module?" />
          <label htmlFor="learning-module-level">Learning level</label>
          <select id="learning-module-level" value={moduleLevel} onChange={(event) => setModuleLevel(event.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <button className="dashboard-button dashboard-button-primary" type="submit" disabled={savingModule}>
            {savingModule ? 'Creating...' : 'Create and publish module'}
          </button>
        </form>

        <form className="learning-manager-card" onSubmit={handleCreateLesson}>
          <h3>Add a lesson</h3>
          <label htmlFor="learning-module-select">Choose module</label>
          <select id="learning-module-select" value={selectedModule} onChange={(event) => setSelectedModule(event.target.value)} required>
            <option value="">Select a module</option>
            {modules.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
          <label htmlFor="learning-lesson-title">Lesson title</label>
          <input id="learning-lesson-title" value={lessonTitle} onChange={(event) => setLessonTitle(event.target.value)} maxLength={160} required placeholder="e.g. Understanding the writing process" />
          <label htmlFor="learning-lesson-order">Lesson number</label>
          <input id="learning-lesson-order" type="number" min="1" step="1" value={lessonOrder} onChange={(event) => setLessonOrder(event.target.value)} required />
          <label htmlFor="learning-lesson-content">Lesson content</label>
          <textarea id="learning-lesson-content" value={lessonContent} onChange={(event) => setLessonContent(event.target.value)} rows={6} required placeholder="Write the lesson notes, examples and activities here..." />
          <button className="dashboard-button dashboard-button-primary" type="submit" disabled={savingLesson || !modules.length}>
            {savingLesson ? 'Publishing...' : 'Publish lesson'}
          </button>
          {!modules.length && <p className="learning-manager-hint">Create a module first, then you can add lessons.</p>}
        </form>
      </div>
      {message && <p className={isError ? 'learning-manager-message is-error' : 'learning-manager-message'} role="status">{message}</p>}
    </section>
  )
}

export default LearningManager
