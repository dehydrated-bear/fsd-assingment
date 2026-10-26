import { useState } from 'react'
import { useSite } from '../data/SiteContext'

export default function Writing() {
  const { posts: articles } = useSite()
  const [showAll, setShowAll] = useState(false)
  return (
    <section
      className="section writing-section"
      id="writing"
      aria-labelledby="writing-heading"
    >
      <div className="section-kicker">
        <span>03 / NOTES ALONG THE WAY</span>
        <span aria-hidden="true">↳</span>
      </div>
      <div className="section-heading-row">
        <h2 id="writing-heading">Thinking out loud.</h2>
        <span className="small-label">Occasionally, in words.</span>
      </div>
      <p className="section-description">
        Things I’m learning, noticing, and working through.
      </p>
      <ul className="writing-list">
        {articles.slice(0, showAll ? articles.length : 2).map((article) => (
          <li key={article.slug}>
            <a className="article-button" href={`/blog/${article.slug}`}>
              <span>
                <span className="article-meta">
                  {article.category} <span aria-hidden="true">·</span>{' '}
                  {article.readTime} read
                </span>
                <span className="article-title">{article.title}</span>
              </span>
              <span className="article-end">
                <time dateTime={article.date}>
                  {new Intl.DateTimeFormat('en-GB', {
                    month: 'short',
                    day: '2-digit',
                    timeZone: 'UTC',
                  }).format(new Date(article.date))}
                </time>
                <span aria-hidden="true">↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <button
        className="text-link all-writing"
        type="button"
        aria-expanded={showAll}
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? 'Show fewer notes' : 'All notes'}{' '}
        <span aria-hidden="true">{showAll ? '↑' : '→'}</span>
      </button>
      {!articles.length && (
        <p className="section-description">
          No notes published yet. Check back soon.
        </p>
      )}
    </section>
  )
}
