import { useState } from 'react'

export default function Contact() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setStatus('sending')
    setMessage('')
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(
          result.error ||
            'Your message could not be saved. Please try again later.',
        )
      }
      setStatus('sent')
      setMessage('Thanks for reaching out. Your message has been saved.')
      form.reset()
    } catch (error) {
      setStatus('error')
      setMessage(
        error.message === 'Failed to fetch'
          ? 'The contact service is unavailable. Please try again later.'
          : error.message,
      )
    }
  }
  return (
    <section
      className="section contact-section"
      id="contact"
      aria-labelledby="contact-heading"
    >
      <div className="section-kicker">
        <span>04 / AN OPEN DOOR</span>
        <span aria-hidden="true">↗</span>
      </div>
      <h2 id="contact-heading">Good things start with a hello.</h2>
      <p className="section-description">
        Have an idea, a question, or a different way of seeing things?
        <br className="desktop-break" /> I’d love to hear it.
      </p>
      <form className="contact-form" onSubmit={submit}>
        <div className="form-row">
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              placeholder="Alex"
              required
              maxLength={100}
            />
          </label>
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              required
              maxLength={254}
            />
          </label>
        </div>
        <label>
          A little about your idea
          <textarea
            name="message"
            rows={3}
            placeholder="What’s on your mind?"
            required
            minLength={10}
            maxLength={5000}
          />
        </label>
        <div className="contact-bottom">
          <button
            className="button button-dark"
            type="submit"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? 'Sending…' : 'Send a note'}{' '}
            <span aria-hidden="true">↗</span>
          </button>
          <span>No mailing list. Just a conversation.</span>
        </div>
        <p
          className={`form-status ${status === 'error' ? 'form-error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      </form>
    </section>
  )
}
