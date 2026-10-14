
import './App.css'

function Home() {
  return (
    <div className="site">
      <header className="navbar">
        <a className="logo" href="#home">
          Legacy<span>Education</span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#discover">Discover</a>
          <a href="#learning">Learning</a>
          <a href="#community">Community</a>
        </nav>

        <div className="nav-actions">
          <a className="login-link" href="#login">Log in</a>
          <a className="button button-small" href="#join">Join the community</a>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">A HOME FOR THE NEXT GENERATION OF CREATIVES</p>
            <h1>Your ideas deserve a <span>legacy.</span></h1>
            <p className="hero-description">
              Discover stories, develop your skills, share your work and
              collaborate with a community turning creativity into impact.
            </p>

            <div className="hero-actions">
              <a className="button" href="#join">Start your journey <span>↗</span></a>
              <a className="text-link" href="#discover">Explore the platform ↓</a>
            </div>

            <div className="hero-note">
              <span className="status-dot"></span>
              A growing space for ideas, learning and collaboration.
            </div>
          </div>

          <div className="hero-art" aria-label="Creative ideas and learning">
            <div className="art-orbit orbit-one"></div>
            <div className="art-orbit orbit-two"></div>
            <div className="art-center">
              <span className="art-star">✳</span>
              <p>CREATE.</p>
              <p>LEARN.</p>
              <p>LEAVE A MARK.</p>
            </div>
            <div className="floating-card card-story">
              <span className="card-icon">✎</span>
              <div><strong>Stories</strong><small>Ideas worth sharing</small></div>
            </div>
            <div className="floating-card card-learn">
              <span className="card-icon">↗</span>
              <div><strong>Learning</strong><small>Skills for your journey</small></div>
            </div>
            <div className="floating-card card-community">
              <span className="card-icon">◎</span>
              <div><strong>Community</strong><small>Better together</small></div>
            </div>
          </div>
        </section>

        <section className="intro-strip">
          <p>YOUR SPACE TO</p>
          <span>Discover ideas</span>
          <span className="strip-divider">✳</span>
          <span>Build skills</span>
          <span className="strip-divider">✳</span>
          <span>Share your voice</span>
          <span className="strip-divider">✳</span>
          <span>Create together</span>
        </section>

        <section className="discover section" id="discover">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE LEGACYEDUCATION</p>
              <h2>One platform.<br /><span>Endless possibilities.</span></h2>
            </div>
            <p className="section-description">
              Find inspiration, gain knowledge and bring your next idea to life.
              Your creative journey starts here.
            </p>
          </div>

          <div className="feature-grid">
            <article className="feature-card stories-card">
              <div className="feature-top"><span>01 / DISCOVER</span><span className="feature-symbol">↗</span></div>
              <div className="feature-illustration story-illustration">
                <span className="illustration-line"></span>
                <span className="illustration-word">Ideas<br />into stories.</span>
                <span className="illustration-circle">✳</span>
              </div>
              <h3>Stories & Articles</h3>
              <p>Read perspectives, discover fresh ideas and share stories that matter.</p>
              <a href="#stories" className="feature-link">Explore stories ↗</a>
            </article>

            <article className="feature-card learning-card" id="learning">
              <div className="feature-top"><span>02 / DEVELOP</span><span className="feature-symbol">↗</span></div>
              <div className="feature-illustration learning-illustration">
                <span className="book-shape">LEARN<br /><small>EVERY DAY</small></span>
                <span className="learning-spark">✦</span>
              </div>
              <h3>Learning Modules</h3>
              <p>Build practical skills and turn curiosity into meaningful progress.</p>
              <a href="#modules" className="feature-link">Start learning ↗</a>
            </article>

            <article className="feature-card media-card">
              <div className="feature-top"><span>03 / EXPERIENCE</span><span className="feature-symbol">↗</span></div>
              <div className="feature-illustration media-illustration">
                <span className="play-button">▶</span>
                <span className="media-label">WATCH · LISTEN · CREATE</span>
              </div>
              <h3>Creative Media</h3>
              <p>Explore inspiring media and discover new ways to express your creativity.</p>
              <a href="#media" className="feature-link">Explore media ↗</a>
            </article>

            <article className="feature-card community-card" id="community">
              <div className="feature-top"><span>04 / COLLABORATE</span><span className="feature-symbol">↗</span></div>
              <div className="feature-illustration community-illustration">
                <span className="people people-one">C</span>
                <span className="people people-two">R</span>
                <span className="people people-three">E</span>
                <span className="community-plus">+</span>
              </div>
              <h3>Creative Community</h3>
              <p>Connect with people, exchange ideas and build something meaningful together.</p>
              <a href="#join" className="feature-link">Meet the community ↗</a>
            </article>
          </div>
        </section>

        <section className="join-banner" id="join">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <h2>Don't just have an idea.<br />Give it a future.</h2>
          </div>
          <a className="button button-light" href="#login">Become part of the journey <span>↗</span></a>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#home">Legacy<span>Education</span></a>
        <p>Learn. Create. Share. Leave a legacy.</p>
        <span>© 2026 LegacyEducation</span>
      </footer>
    </div>
  )
}

export default Home
