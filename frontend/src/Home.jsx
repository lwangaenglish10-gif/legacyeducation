
import './App.css'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from './services/api'

function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
const [newsletterConsent, setNewsletterConsent] = useState(false)
const [newsletterMessage, setNewsletterMessage] = useState('')
const [newsletterLoading, setNewsletterLoading] = useState(false)

async function handleNewsletterSubmit(event) {
  event.preventDefault()
  setNewsletterMessage('')
  setNewsletterLoading(true)

  try {
    const result = await api.subscribeNewsletter(
      newsletterEmail,
      newsletterConsent
    )
    setNewsletterMessage(result.message)
    setNewsletterEmail('')
    setNewsletterConsent(false)
  } catch (error) {
    setNewsletterMessage(
      error.message || 'Subscription failed. Please try again.'
    )
  } finally {
    setNewsletterLoading(false)
  }
}

  return (
    <div className="site">
      <header className="navbar">
        <a className="logo" href="#home" aria-label="LegacyEducation home">
          Legacy<span>Education</span>
        </a>

        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#discover">Discover</a>
          <a href="#learning">Learning</a>
          <a href="#media">Media</a>
          <a href="#community">Community</a>
        </nav>

        <div className="nav-actions">
          <Link className="login-link" to="/login">
            Log in
          </Link>
          <Link className="button button-small" to="/register">
            Join LegacyEducation
          </Link>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">
              A HOME FOR THE NEXT GENERATION OF CREATIVES
            </p>

            <h1>
              Your ideas deserve a <span>legacy.</span>
            </h1>

            <p className="hero-description">
              Discover new perspectives, develop practical skills,
              share your work and connect with a community that
              believes creativity can make a difference.
            </p>

            <div className="hero-actions">
              <Link className="button" to="/register">
                Start your journey <span>↗</span>
              </Link>

              <a className="text-link" href="#discover">
                Explore the platform ↓
              </a>
            </div>

            <div className="hero-note">
              <span className="status-dot" aria-hidden="true" />
              A growing space for ideas, learning and collaboration.
            </div>
          </div>

          <div
            className="hero-art"
            role="img"
            aria-label="Creative ideas, learning and collaboration"
          >
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />

            <div className="art-center">
              <span className="art-star" aria-hidden="true">✳</span>
              <p>CREATE.</p>
              <p>LEARN.</p>
              <p>LEAVE A MARK.</p>
            </div>

            <div className="floating-card card-story">
              <span className="card-icon" aria-hidden="true">✎</span>
              <div>
                <strong>Stories</strong>
                <small>Ideas worth sharing</small>
              </div>
            </div>

            <div className="floating-card card-learn">
              <span className="card-icon" aria-hidden="true">↗</span>
              <div>
                <strong>Learning</strong>
                <small>Skills for your journey</small>
              </div>
            </div>

            <div className="floating-card card-community">
              <span className="card-icon" aria-hidden="true">◎</span>
              <div>
                <strong>Community</strong>
                <small>Better together</small>
              </div>
            </div>
          </div>
        </section>

        <section className="intro-strip" aria-label="Our mission">
          <p>YOUR SPACE TO</p>
          <span>Discover ideas</span>
          <span className="strip-divider" aria-hidden="true">✳</span>
          <span>Build skills</span>
          <span className="strip-divider" aria-hidden="true">✳</span>
          <span>Share your voice</span>
          <span className="strip-divider" aria-hidden="true">✳</span>
          <span>Create together</span>
        </section>

        <section className="discover section" id="discover">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE LEGACYEDUCATION</p>
              <h2>
                One platform.
                <br />
                <span>Endless possibilities.</span>
              </h2>
            </div>

            <p className="section-description">
              Find inspiration, develop your abilities and take
              your next idea further. Explore the different ways
              you can learn, create and contribute.
            </p>
          </div>

          <div className="feature-grid">
            <article
              className="feature-card stories-card"
              id="stories"
            >
              <div className="feature-top">
                <span>01 / DISCOVER</span>
                <span className="feature-symbol" aria-hidden="true">↗</span>
              </div>

              <div className="feature-illustration story-illustration" aria-hidden="true">
                <span className="illustration-line" />
                <span className="illustration-word">
                  Ideas
                  <br />
                  into stories.
                </span>
                <span className="illustration-circle">✳</span>
              </div>

              <h3>Stories &amp; Articles</h3>
              <p>
                Read perspectives, discover fresh ideas and explore
                stories that inform, inspire and challenge you.
              </p>

              <Link to="/stories" className="feature-link">
  Explore stories ↗
</Link>
              <p className="feature-note">
                Discover the stories section
              </p>
            </article>

            <article
              className="feature-card learning-card"
              id="learning"
            >
              <div className="feature-top">
                <span>02 / DEVELOP</span>
                <span className="feature-symbol" aria-hidden="true">↗</span>
              </div>

              <div className="feature-illustration learning-illustration" aria-hidden="true">
                <span className="book-shape">
                  LEARN
                  <br />
                  <small>EVERY DAY</small>
                </span>
                <span className="learning-spark">✦</span>
              </div>

              <h3>Learning Modules</h3>
              <p>
                Build practical skills through structured learning
                and take the next step towards your creative goals.
              </p>

              <Link to="/dashboard" className="feature-link">
                Start learning ↗
              </Link>
              <p className="feature-note">
                Sign in to access your learning dashboard
              </p>
            </article>

            <article
              className="feature-card media-card"
              id="media"
            >
              <div className="feature-top">
                <span>03 / EXPERIENCE</span>
                <span className="feature-symbol" aria-hidden="true">↗</span>
              </div>

              <div className="feature-illustration media-illustration" aria-hidden="true">
                <span className="play-button">▶</span>
                <span className="media-label">
                  WATCH · LISTEN · CREATE
                </span>
              </div>

              <h3>Creative Media</h3>
              <p>
                Explore creative resources and discover different
                ways to communicate ideas through media.
              </p>

              <Link to="/dashboard" className="feature-link">
                Explore media ↗
              </Link>
              <p className="feature-note">
                Sign in to visit the media library
              </p>
            </article>

            <article
              className="feature-card community-card"
              id="community"
            >
              <div className="feature-top">
                <span>04 / COLLABORATE</span>
                <span className="feature-symbol" aria-hidden="true">↗</span>
              </div>

              <div className="feature-illustration community-illustration" aria-hidden="true">
                <span className="people people-one">C</span>
                <span className="people people-two">R</span>
                <span className="people people-three">E</span>
                <span className="community-plus">+</span>
              </div>

              <h3>Creative Community</h3>
              <p>
                Begin connecting with other creatives, exchange
                ideas and explore opportunities to collaborate.
              </p>

              <Link to="/register" className="feature-link">
                Join the community ↗
              </Link>
              <p className="feature-note">
                Create an account to get started
              </p>
            </article>
          </div>
        </section>

        <section className="join-banner" id="join">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <h2>
              Don't just have an idea.
              <br />
              Give it a future.
            </h2>
            <p>
              Join a growing platform built around learning,
              expression and creative possibility.
            </p>
          </div>

          <Link className="button button-light" to="/register">
            Become part of the journey <span>↗</span>
          </Link>
        </section>

<section className="newsletter-section" id="newsletter">
  <div className="newsletter-content">
    <p className="eyebrow">THE LEGACYEDUCATION LETTER</p>
    <h2>Ideas worth sharing.</h2>
    <p>
      Get creative stories, learning opportunities and platform
      updates delivered to your inbox.
    </p>

    <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
      <label htmlFor="newsletter-email">Email address</label>
      <input
        id="newsletter-email"
        type="email"
        value={newsletterEmail}
        onChange={(event) => setNewsletterEmail(event.target.value)}
        placeholder="you@example.com"
        maxLength={254}
        required
      />

      <label className="newsletter-consent">
        <input
          type="checkbox"
          checked={newsletterConsent}
          onChange={(event) => setNewsletterConsent(event.target.checked)}
          required
        />
        I agree to receive newsletter updates from LegacyEducation.
      </label>

      <button
        className="button"
        type="submit"
        disabled={newsletterLoading}
      >
        {newsletterLoading ? 'Subscribing...' : 'Subscribe to updates'}
      </button>

      {newsletterMessage && (
        <p role="status" aria-live="polite">
          {newsletterMessage}
        </p>
      )}
    </form>
  </div>
</section>

      </main>

      <footer className="footer">
        <a className="logo" href="#home">
          Legacy<span>Education</span>
        </a>

        <p>Learn. Create. Share. Leave a legacy.</p>

        <nav aria-label="Footer navigation">
          <a href="#discover">Discover</a>
          <a href="#learning">Learning</a>
          <a href="#media">Media</a>
          <a href="#join">Join us</a>
          <Link to="/login">Log in</Link>
        </nav>

        <span>© 2026 LegacyEducation</span>
      </footer>
    </div>
  )
}

export default Home
