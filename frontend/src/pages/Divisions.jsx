import { Link } from 'react-router-dom'
import './Divisions.css'

const divisions = [
  {
    number: '01',
    name: 'LegacyEducation',
    description: 'Learn, develop practical skills and turn creative ideas into meaningful work.',
    detail: 'Courses · Learning modules · Resources',
    link: '/learn',
    action: 'Explore learning',
    status: 'Active platform',
  },
  {
    number: '02',
    name: 'Legacy Publishing',
    description: 'Discover stories, articles, poetry and original literary work from emerging voices.',
    detail: 'Stories · Articles · Books',
    link: '/stories',
    action: 'Explore stories',
    status: 'Publishing foundation',
  },
  {
    number: '03',
    name: 'Legacy Media',
    description: 'A home for original video, conversations, interviews and creative productions.',
    detail: 'Video · Interviews · Original shows',
    link: '/library',
    action: 'Explore the library',
    status: 'Growing',
  },
  {
    number: '04',
    name: 'Legacy Creative Studio',
    description: 'Creative services and collaborations for people and organisations with ideas to share.',
    detail: 'Design · Writing · Creative projects',
    link: null,
    action: null,
    status: 'Coming soon',
  },
]

function Divisions() {
  return (
    <div className="site divisions-page">
      <header className="navbar divisions-navbar">
        <Link className="logo" to="/" aria-label="Legacy Dream Arts home">
          Legacy<span>Dream Arts</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/divisions" aria-current="page">Our divisions</Link>
          <Link to="/stories">Stories</Link>
          <Link to="/learn">Learning</Link>
        </nav>
        <div className="nav-actions">
          <Link className="login-link" to="/login">Log in</Link>
          <Link className="button button-small" to="/register">Join Legacy</Link>
        </div>
      </header>

      <main>
        <section className="divisions-hero">
          <p className="eyebrow">ONE HOUSE · MANY CREATIVE PATHS</p>
          <h1>A home for ideas, learning and <span>creative possibility.</span></h1>
          <p>
            Legacy Dream Arts brings education, publishing, media and creative
            services together under one house. Explore each division and follow
            the path that speaks to you.
          </p>
        </section>

        <section className="division-grid-section" aria-label="Legacy Dream Arts divisions">
          <div className="division-grid">
            {divisions.map((division) => (
              <article className="division-card" key={division.name}>
                <div className="division-card-top">
                  <span>{division.number} / DIVISION</span>
                  <span className="division-status">{division.status}</span>
                </div>
                <h2>{division.name}</h2>
                <p>{division.description}</p>
                <span className="division-detail">{division.detail}</span>
                {division.link ? (
                  <Link className="feature-link" to={division.link}>
                    {division.action} ↗
                  </Link>
                ) : (
                  <span className="division-coming-soon">New division taking shape</span>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="division-community">
          <p className="eyebrow">THE HOUSE THAT CONNECTS US</p>
          <h2>Different disciplines. One creative community.</h2>
          <p>
            Whether you are here to learn, read, publish, create or collaborate,
            there is a place for your ideas at Legacy Dream Arts.
          </p>
          <Link className="button" to="/register">Become part of the community ↗</Link>
        </section>
      </main>

      <footer className="footer">
        <Link className="logo" to="/">Legacy<span>Dream Arts</span></Link>
        <p>Ideas. Learning. Stories. Culture.</p>
        <nav aria-label="Footer navigation">
          <Link to="/">Home</Link>
          <Link to="/divisions">Our divisions</Link>
          <Link to="/stories">Publishing</Link>
          <Link to="/learn">Education</Link>
        </nav>
        <span>© 2026 Legacy Dream Arts</span>
      </footer>
    </div>
  )
}

export default Divisions
