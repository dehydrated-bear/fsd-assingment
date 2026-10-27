import { Site, Post, AdminSession } from './models/Content.js'
import { Message } from './models/Message.js'
import {
  profile,
  projects,
  articles,
  keepsakes,
} from '../../portfolioweb/src/data/content.js'

export const initialSite = {
  profile,
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
  projects,
  keepsakes,
}
export async function initializeContent() {
  await Promise.all([Site.init(), Post.init(), AdminSession.init()])
  const result = await Site.updateOne(
    { key: 'main' },
    { $setOnInsert: { content: initialSite } },
    { upsert: true },
  )
  if (result.upsertedCount)
    await Post.insertMany(
      articles.map((post) => ({ ...post, published: true })),
    )
}
const fields = '-_id -__v'
export const contentStore = {
  getSite: async () => (await Site.findOne({ key: 'main' }).lean())?.content,
  saveSite: async (content) => {
    await Site.updateOne(
      { key: 'main' },
      { $set: { content } },
      { upsert: true },
    )
    return content
  },
  listPosts: (admin = false) =>
    Post.find(admin ? {} : { published: true })
      .select(fields)
      .sort({ date: -1, createdAt: -1 })
      .lean(),
  getPost: (slug, admin = false) =>
    Post.findOne({ slug, ...(admin ? {} : { published: true }) })
      .select(fields)
      .lean(),
  createPost: async (data) => {
    await Post.create(data)
    return data
  },
  updatePost: (slug, data) =>
    Post.findOneAndUpdate(
      { slug },
      { $set: data },
      { new: true, runValidators: true },
    )
      .select(fields)
      .lean(),
  deletePost: (slug) => Post.findOneAndDelete({ slug }).lean(),
  listMessages: (page) =>
    Message.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * 25)
      .limit(25)
      .lean(),
  deleteMessage: (id) => Message.findByIdAndDelete(id).lean(),
  createSession: (session) => AdminSession.create(session),
  getSession: (tokenHash) =>
    AdminSession.findOne({ tokenHash, expiresAt: { $gt: new Date() } }).lean(),
  deleteSession: (tokenHash) => AdminSession.deleteOne({ tokenHash }),
}
