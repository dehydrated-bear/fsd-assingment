import mongoose from 'mongoose'

const siteSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main' },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)
const postSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: String,
    category: String,
    date: String,
    readTime: String,
    paragraphs: [String],
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
)
const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, unique: true },
  csrf: String,
  expiresAt: { type: Date, expires: 0 },
})
export const Site = mongoose.model('Site', siteSchema)
export const Post = mongoose.model('Post', postSchema)
export const AdminSession = mongoose.model('AdminSession', sessionSchema)
