import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import './Admin.css'

const paragraphs = (value) =>
  value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
const emptyPost = () => ({
  title: '',
  slug: '',
  category: 'Notes',
  date: new Date().toISOString().slice(0, 10),
  readTime: '3 min',
  body: '',
  published: false,
})
function Field({ label, value, onChange, multiline = false, ...rest }) {
  const Input = multiline ? 'textarea' : 'input'
  return (
    <label className="admin-field">
      {label}
      <Input
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        {...(multiline ? { rows: 4 } : {})}
        {...rest}
      />
    </label>
  )
}

export default function Admin() {
  const [session, setSession] = useState(undefined)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('Profile')
  const [site, setSite] = useState(null)
  const [posts, setPosts] = useState([])
  const [messages, setMessages] = useState([])
  const [page, setPage] = useState(1)
  const [post, setPost] = useState(emptyPost)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    document.title = 'Portfolio admin'
    api('/admin/session', { signal: controller.signal })
      .then(setSession)
      .catch((error) => {
        if (error.name === 'AbortError') return
        setSession(null)
        if (error.status !== 401) setError(error.message)
      })
    return () => controller.abort()
  }, [])

  const fetchContent = useCallback(
    () =>
      Promise.all([
        api('/admin/site'),
        api('/admin/posts'),
        api(`/admin/messages?page=${page}`),
      ]),
    [page],
  )
  const applyContent = useCallback(([siteData, postData, messageData]) => {
    setSite(siteData)
    setPosts(postData)
    setMessages(messageData.messages)
  }, [])
  const load = async () => applyContent(await fetchContent())
  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchContent()
      .then((data) => {
        if (!cancelled) applyContent(data)
      })
      .catch((error) => {
        if (!cancelled) {
          setError(error.message)
          if (error.status === 401) setSession(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [session, fetchContent, applyContent])

  async function action(work, success) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await work()
      if (success) setNotice(success)
    } catch (error) {
      setError(error.message)
      if (error.status === 401) setSession(null)
    } finally {
      setBusy(false)
    }
  }
  const request = (path, method, body) =>
    api(`/admin${path}`, { method, body: body ?? {}, csrf: session?.csrf })
  const update = (field, value) =>
    setSite((current) => ({ ...current, [field]: value }))
  function updateItem(collection, index, key, value) {
    setSite((current) => ({
      ...current,
      [collection]: current[collection].map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }))
  }
  const saveSite = (event) => {
    event.preventDefault()
    action(async () => {
      const result = await request('/site', 'PUT', site)
      setSite(result)
    }, 'Saved. Refresh the public website to see your changes.')
  }
  async function login(event) {
    event.preventDefault()
    await action(async () => {
      const result = await api('/admin/login', {
        method: 'POST',
        body: { email, password },
      })
      setPassword('')
      setSession(result)
    })
  }
  function editPost(item) {
    setEditing(item.slug)
    setPost({ ...item, body: item.paragraphs.join('\n\n') })
    setError('')
    setNotice('')
  }
  function savePost(event) {
    event.preventDefault()
    action(async () => {
      const { body, ...fields } = post
      await request(
        editing ? `/posts/${encodeURIComponent(editing)}` : '/posts',
        editing ? 'PUT' : 'POST',
        { ...fields, paragraphs: paragraphs(body) },
      )
      setEditing(null)
      setPost(emptyPost())
      setPosts(await api('/admin/posts'))
    }, 'Article saved.')
  }
  function removePost(slug) {
    if (!window.confirm(`Permanently delete “${slug}”?`)) return
    action(async () => {
      await request(`/posts/${encodeURIComponent(slug)}`, 'DELETE')
      setPosts(await api('/admin/posts'))
      if (editing === slug) {
        setEditing(null)
        setPost(emptyPost())
      }
    }, 'Article deleted.')
  }

  if (session === undefined)
    return (
      <main className="admin-shell">
        <p role="status">Checking your session…</p>
      </main>
    )
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">YOUR LITTLE CORNER</p>
          <h1>Portfolio studio.</h1>
        </div>
        <a href="/" className="text-link">
          View site ↗
        </a>
      </header>
      <p role="alert" className="admin-error">
        {error}
      </p>
      <p role="status" className="admin-notice">
        {notice}
      </p>
      {!session ? (
        <form className="admin-login" onSubmit={login}>
          <h2>Admin sign in</h2>
          <p>
            This area is private. Configure your credentials in the server
            environment first.
          </p>
          <Field
            label="Admin email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={setEmail}
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
            value={password}
            onChange={setPassword}
          />
          <button className="button button-dark" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <>
          <div className="admin-session">
            <span>Signed in as {session.email}</span>
            <button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  await request('/logout', 'POST')
                  setSession(null)
                  setSite(null)
                })
              }
            >
              Sign out
            </button>
          </div>
          <nav className="admin-tabs" aria-label="Admin sections">
            {['Profile', 'Projects', 'Paper notes', 'Blog', 'Messages'].map(
              (item) => (
                <button
                  key={item}
                  aria-current={tab === item ? 'page' : undefined}
                  onClick={() => {
                    setTab(item)
                    setNotice('')
                    setError('')
                  }}
                >
                  {item}
                </button>
              ),
            )}
          </nav>
          {!site && (
            <p>
              Loading your content…{' '}
              <button onClick={() => action(load)}>Retry</button>
            </p>
          )}
          {site && ['Profile', 'Projects', 'Paper notes'].includes(tab) && (
            <form className="admin-editor" onSubmit={saveSite}>
              {tab === 'Profile' && (
                <>
                  <h2>Your profile</h2>
                  <div className="admin-grid">
                    {[
                      ['name', 'Display name'],
                      ['location', 'Location'],
                      ['timezone', 'Timezone (for example Asia/Kolkata)'],
                      ['timezoneLabel', 'Timezone label'],
                    ].map(([field, label]) => (
                      <Field
                        key={field}
                        label={label}
                        required
                        value={site.profile[field]}
                        onChange={(value) =>
                          update('profile', { ...site.profile, [field]: value })
                        }
                      />
                    ))}
                  </div>
                  <Field
                    label="Hero tagline (line breaks allowed)"
                    multiline
                    required
                    maxLength={180}
                    value={site.tagline}
                    onChange={(value) => update('tagline', value)}
                  />
                  <Field
                    label="Introduction (blank line between paragraphs)"
                    multiline
                    required
                    value={site.intro.join('\n\n')}
                    onChange={(value) => update('intro', value.split('\n\n'))}
                  />
                  <Field
                    label="About (blank line between paragraphs)"
                    multiline
                    required
                    value={site.about.join('\n\n')}
                    onChange={(value) => update('about', value.split('\n\n'))}
                  />
                  <Field
                    label="Availability text"
                    required
                    maxLength={150}
                    value={site.availability}
                    onChange={(value) => update('availability', value)}
                  />
                </>
              )}
              {tab === 'Projects' && (
                <>
                  <h2>Selected projects</h2>
                  <p className="admin-help">
                    Use a local image path or an HTTPS image URL. Preview kinds:
                    notes, timer, or image.
                  </p>
                  {site.projects.map((item, index) => (
                    <fieldset key={index}>
                      <legend>Project {index + 1}</legend>
                      <div className="admin-grid">
                        {[
                          ['id', 'Unique ID'],
                          ['name', 'Name'],
                          ['type', 'Short label'],
                          ['year', 'Year'],
                          ['image', 'Preview image URL / path'],
                          ['url', 'Project link (optional)'],
                        ].map(([field, label]) => (
                          <Field
                            key={field}
                            label={label}
                            value={item[field]}
                            onChange={(value) =>
                              updateItem('projects', index, field, value)
                            }
                          />
                        ))}
                      </div>
                      <label className="admin-field">
                        Preview kind
                        <select
                          value={item.kind}
                          onChange={(event) =>
                            updateItem(
                              'projects',
                              index,
                              'kind',
                              event.target.value,
                            )
                          }
                        >
                          <option value="notes">Notebook demo</option>
                          <option value="timer">Timer demo</option>
                          <option value="image">Image</option>
                        </select>
                      </label>
                      <Field
                        label="Description"
                        multiline
                        required
                        value={item.description}
                        onChange={(value) =>
                          updateItem('projects', index, 'description', value)
                        }
                      />
                      <Field
                        label="Project detail"
                        multiline
                        required
                        value={item.detail}
                        onChange={(value) =>
                          updateItem('projects', index, 'detail', value)
                        }
                      />
                      <Field
                        label="Technologies (comma-separated)"
                        value={item.stack.join(', ')}
                        onChange={(value) =>
                          updateItem(
                            'projects',
                            index,
                            'stack',
                            value.split(',').map((part) => part.trim()),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="admin-danger"
                        onClick={() =>
                          update(
                            'projects',
                            site.projects.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove project
                      </button>
                    </fieldset>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      update('projects', [
                        ...site.projects,
                        {
                          id: `project-${Date.now()}`,
                          name: 'New project',
                          type: 'An experiment',
                          year: String(new Date().getFullYear()),
                          kind: 'notes',
                          description: 'Describe your project.',
                          detail: 'What did you learn?',
                          stack: [],
                          image: '',
                          url: '',
                        },
                      ])
                    }
                    disabled={site.projects.length >= 20}
                  >
                    + Add project
                  </button>
                </>
              )}
              {tab === 'Paper notes' && (
                <>
                  <h2>Photos & folded notes</h2>
                  <p className="admin-help">
                    Up to three keepsakes. Add images to public/keepsakes, then
                    enter their /keepsakes/filename.jpg path, or use a
                    CORS-enabled HTTPS image URL. This editor does not upload
                    image files.
                  </p>
                  {site.keepsakes.map((item, index) => (
                    <fieldset key={item.id}>
                      <legend>Paper {index + 1}</legend>
                      {[
                        ['id', 'Unique ID'],
                        ['label', 'Label below the paper'],
                        ['title', 'Printed title'],
                        ['image', 'Image URL / path'],
                        ['alt', 'Image description'],
                        ['note', 'Printed note (140 characters maximum)'],
                      ].map(([field, label]) => (
                        <Field
                          key={field}
                          label={label}
                          required
                          maxLength={
                            field === 'note'
                              ? 140
                              : field === 'title'
                                ? 45
                                : 2048
                          }
                          value={item[field]}
                          onChange={(value) =>
                            updateItem('keepsakes', index, field, value)
                          }
                        />
                      ))}
                      <button
                        type="button"
                        className="admin-danger"
                        onClick={() =>
                          update(
                            'keepsakes',
                            site.keepsakes.filter((_, i) => i !== index),
                          )
                        }
                      >
                        Remove paper
                      </button>
                    </fieldset>
                  ))}
                  <button
                    type="button"
                    disabled={site.keepsakes.length >= 3}
                    onClick={() =>
                      update('keepsakes', [
                        ...site.keepsakes,
                        {
                          id: `paper-${Date.now()}`,
                          title: 'A small moment.',
                          label: 'A keepsake',
                          image: '/keepsakes/long-way.svg',
                          alt: 'An illustrated mountain landscape',
                          note: 'A little moment worth remembering.',
                        },
                      ])
                    }
                  >
                    + Add paper
                  </button>
                </>
              )}
              <button className="button button-dark admin-save" disabled={busy}>
                {busy ? 'Saving…' : 'Save site changes'}
              </button>
            </form>
          )}
          {tab === 'Blog' && (
            <section className="admin-editor">
              <h2>The notebook</h2>
              <p className="admin-help">
                Drafts stay private. Published articles appear on the public
                website. Text is rendered as plain paragraphs, never injected
                HTML.
              </p>
              <div className="admin-post-list">
                {posts.map((item) => (
                  <div key={item.slug}>
                    <span>
                      <strong>{item.title}</strong>
                      <small>
                        {item.published ? 'Published' : 'Draft'} · /blog/
                        {item.slug}
                      </small>
                    </span>
                    <button onClick={() => editPost(item)}>Edit</button>
                    <button
                      disabled={busy}
                      className="admin-danger"
                      onClick={() => removePost(item.slug)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setEditing(null)
                  setPost(emptyPost())
                }}
              >
                + New article
              </button>
              <form onSubmit={savePost}>
                <h3>{editing ? `Editing: ${editing}` : 'New article'}</h3>
                <div className="admin-grid">
                  {[
                    ['title', 'Title'],
                    ['slug', 'URL slug (lowercase-with-hyphens)'],
                    ['category', 'Category'],
                    ['date', 'Date'],
                    ['readTime', 'Reading time'],
                  ].map(([field, label]) => (
                    <Field
                      key={field}
                      label={label}
                      required
                      type={field === 'date' ? 'date' : 'text'}
                      value={post[field]}
                      onChange={(value) => setPost({ ...post, [field]: value })}
                    />
                  ))}
                </div>
                <Field
                  label="Article (blank line between paragraphs)"
                  multiline
                  required
                  rows={14}
                  value={post.body}
                  onChange={(value) => setPost({ ...post, body: value })}
                />
                <label className="admin-checkbox">
                  <input
                    type="checkbox"
                    checked={post.published}
                    onChange={(event) =>
                      setPost({ ...post, published: event.target.checked })
                    }
                  />
                  Publish this article
                </label>
                <button className="button button-dark" disabled={busy}>
                  {busy ? 'Saving…' : 'Save article'}
                </button>
              </form>
            </section>
          )}
          {tab === 'Messages' && (
            <section className="admin-editor">
              <h2>Inbox</h2>
              <p className="admin-help">
                Contact submissions are stored here. No email delivery is
                configured.
              </p>
              {messages.length === 0 && <p>No messages on this page.</p>}
              {messages.map((message) => (
                <article className="admin-message" key={message._id}>
                  <h3>{message.name}</h3>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                  <time>{new Date(message.createdAt).toLocaleString()}</time>
                  <p>{message.message}</p>
                  <button
                    disabled={busy}
                    className="admin-danger"
                    onClick={() => {
                      if (window.confirm('Permanently delete this message?'))
                        action(async () => {
                          await request(`/messages/${message._id}`, 'DELETE')
                          await load()
                        }, 'Message deleted.')
                    }}
                  >
                    Delete message
                  </button>
                </article>
              ))}
              <div className="admin-pagination">
                <button
                  disabled={page === 1 || busy}
                  onClick={() => setPage(page - 1)}
                >
                  ← Previous
                </button>
                <span>Page {page}</span>
                <button
                  disabled={messages.length < 25 || busy}
                  onClick={() => setPage(page + 1)}
                >
                  Next →
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}
