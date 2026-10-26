import { useEffect, useState } from 'react'
import { SiteContext } from './SiteContext'
import { profile, projects, keepsakes, articles } from './content'
import { api } from '../lib/api'

const previewSite = {
  profile,
  projects,
  keepsakes,
  tagline: 'Thoughtful interfaces.\nUseful little things.',
  intro: [
    `I’m a developer based in ${profile.location}, exploring the space where thoughtful design meets practical code.`,
    'I like turning everyday friction into simple tools. Currently learning by building with React, Node.js, and a healthy amount of curiosity.',
  ],
  about: [
    'I’m interested in how things work, and how they could work a little better. This space is a collection of experiments, lessons, and things I’m happy to have made.',
    'Away from the editor, you’ll usually find me collecting new ideas, taking a longer route home, or starting another side project.',
  ],
  availability: 'Open to conversations and collaborations',
}
export default function SiteProvider({ children }) {
  const [content, setContent] = useState({
    site: previewSite,
    posts: articles,
    source: 'loading',
  })
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      api('/site', { signal: controller.signal }),
      api('/posts', { signal: controller.signal }),
    ])
      .then(([site, posts]) => setContent({ site, posts, source: 'database' }))
      .catch((error) => {
        if (error.name !== 'AbortError')
          setContent({ site: previewSite, posts: articles, source: 'preview' })
      })
    return () => controller.abort()
  }, [])
  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>
}
