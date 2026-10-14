
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Auth.css'

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.login(form)

      if (!data.token || !data.user) {
        throw new Error('The server returned an unexpected login response.')
      }

      localStorage.setItem('legacyeducation_token', data.token)
      localStorage.setItem('legacyeducation_user', JSON.stringify(data.user))

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-logo">
        Legacy<span>Education</span>
      </Link>

      <section className="auth-card">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Good to see you.</h1>
        <p className="auth-intro">
          Sign in to continue your creative journey.
        </p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button className="button auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <span>↗</span>}
          </button>
        </form>

        <p className="auth-switch">
          New to LegacyEducation? <Link to="/register">Create an account</Link>
        </p>
      </section>

      <p className="auth-footer">Learn. Create. Share. Leave a legacy.</p>
    </main>
  )
}

export default Login
