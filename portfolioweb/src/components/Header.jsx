import { useEffect, useState } from 'react'
import { useSite } from '../data/SiteContext'

export default function Header({ creative, onToggle }) {
  const {
    site: { profile },
  } = useSite()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <header className="topbar" id="top">
      <a href="#top" className="wordmark" aria-label={`${profile.name}, home`}>
        {profile.name.charAt(0).toLowerCase()}
        <span aria-hidden="true">.</span>
      </a>
      <div className="location">
        <span>{profile.location}</span>
        <time dateTime={now.toISOString()}>
          {new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: profile.timezone,
          }).format(now)}{' '}
          {profile.timezoneLabel}
        </time>
      </div>
      <nav className="top-nav" aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="#writing">Writing</a>
        <a href="#contact">Contact</a>
      </nav>
      <button
        className="creative-control"
        type="button"
        role="switch"
        aria-checked={creative}
        onClick={onToggle}
      >
        <span className="creative-label">
          Creative mode <span aria-hidden="true">✧</span>
        </span>
        <span
          className={`switch ${creative ? 'is-on' : ''}`}
          aria-hidden="true"
        >
          <span />
        </span>
      </button>
    </header>
  )
}
