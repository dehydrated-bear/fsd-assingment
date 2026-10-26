import { useEffect, useState } from 'react'
import Header from './components/Header'
import Avatar from './components/Avatar'
import ElasticName from './components/ElasticName'
import Projects from './components/Projects'
import Writing from './components/Writing'
import Contact from './components/Contact'
import PaperMemories from './components/PaperMemories'
import { useSite } from './data/SiteContext'
import './App.css'

export default function App() {
  const [creative, setCreative] = useState(false)
  const { site } = useSite()
  const { profile } = site
  useEffect(() => {
    document.title = `${profile.name} — Developer & curious human`
  }, [profile.name])
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page-shell">
        <Header creative={creative} onToggle={() => setCreative(!creative)} />
        <main id="main" className="reading-column">
          <section className="intro" aria-labelledby="intro-title">
            <div className="portrait-row">
              <Avatar creative={creative} />
              <span className="portrait-note">
                <svg
                  className="portrait-note-arrow"
                  viewBox="0 0 48 32"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M43 5C28 2 15 9 8 25m0 0 1-12m-1 12 12-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="portrait-note-text">
                  {creative
                    ? 'A little curiosity looks good on you.'
                    : 'A person behind the pixels.'}
                </span>
              </span>
            </div>
            <p className="eyebrow" id="intro-title">
              Developer & curious human
            </p>
            <ElasticName name={profile.name} />
            <p className="tagline" style={{ whiteSpace: 'pre-line' }}>
              {site.tagline}
            </p>
            <div className="intro-copy">
              {site.intro.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
            <div className="intro-actions">
              <a className="button button-dark" href="#contact">
                Let’s talk <span aria-hidden="true">↗</span>
              </a>
              <a className="text-link" href="#work">
                Explore my work <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="availability">
              <span aria-hidden="true" />
              {site.availability}
            </div>
          </section>
          <Projects />
          <section
            className="about-section section"
            id="about"
            aria-labelledby="about-heading"
          >
            <div className="section-kicker">
              <span>02 / A LITTLE CONTEXT</span>
              <span aria-hidden="true">✳</span>
            </div>
            <h2 id="about-heading">More than a screen.</h2>
            {site.about.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
            <div className="toolbox" aria-label="My toolkit">
              {['MongoDB', 'Express', 'React', 'Node.js', 'Git', 'Figma'].map(
                (tool) => (
                  <span key={tool}>{tool}</span>
                ),
              )}
            </div>
          </section>
          <PaperMemories />
          <Writing />
          <Contact />
          <footer className="footer">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <a href="/admin">Admin</a>
            <span>A small corner of the internet.</span>
            <a href="#top">Back to top ↑</a>
          </footer>
        </main>
      </div>
    </>
  )
}
