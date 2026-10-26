import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useSite } from '../data/SiteContext'
import '../App.css'

export default function BlogPost({ slug }) {
  const { source, posts } = useSite()
  const [result, setResult] = useState({ loading: true })
  useEffect(() => {
    const controller = new AbortController()
    api(`/posts/${encodeURIComponent(slug)}`, { signal: controller.signal })
      .then((post) => {
        setResult({ post })
        document.title = post.title
      })
      .catch((error) => {
        if (error.name !== 'AbortError')
          setResult({
            error:
              error.status === 404
                ? 'This article is not available.'
                : error.message,
            offline: error.status !== 404,
          })
      })
    return () => controller.abort()
  }, [slug])
  const preview =
    result.offline && source === 'preview'
      ? posts.find((post) => post.slug === slug)
      : null
  const post = result.post || preview
  return (
    <main className="blog-page">
      <a className="text-link" href="/#writing">
        ← Back to the notebook
      </a>
      {result.loading ? (
        <p role="status">Loading article…</p>
      ) : post ? (
        <article>
          {preview && (
            <p className="preview-notice">Offline preview · sample article</p>
          )}
          <p className="eyebrow">
            {post.category} · {post.readTime} read
          </p>
          <h1>{post.title}</h1>
          <time dateTime={post.date}>
            {new Intl.DateTimeFormat('en', {
              dateStyle: 'long',
              timeZone: 'UTC',
            }).format(new Date(post.date))}
          </time>
          <div className="blog-prose">
            {post.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      ) : (
        <p role="alert">{result.error}</p>
      )}
    </main>
  )
}
