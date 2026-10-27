import { z } from 'zod'

const text = (max) => z.string().trim().min(1).max(max)
const image = z
  .string()
  .max(2048)
  .refine(
    (value) => /^\/(?!\/)/.test(value) || /^https:\/\//.test(value),
    'Use a local /path or an https:// image URL.',
  )
const link = z
  .union([
    z.literal(''),
    z
      .string()
      .url()
      .max(2048)
      .refine((value) => /^https?:\/\//.test(value), 'Use an http(s) link.'),
  ])
  .default('')
export const postInput = z.object({
  slug: text(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text(180),
  category: text(80),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(value)
      return !Number.isNaN(+date) && date.toISOString().slice(0, 10) === value
    }),
  readTime: text(30),
  paragraphs: z.array(text(10000)).min(1).max(30),
  published: z.boolean(),
})
export const siteInput = z.object({
  profile: z.object({
    name: text(80),
    location: text(100),
    timezone: text(100).refine((value) => {
      try {
        new Intl.DateTimeFormat('en', { timeZone: value })
        return true
      } catch {
        return false
      }
    }, 'Choose a valid IANA timezone.'),
    timezoneLabel: text(20),
  }),
  tagline: text(180),
  intro: z.array(text(3000)).min(1).max(6),
  about: z.array(text(3000)).min(1).max(6),
  availability: text(150),
  projects: z
    .array(
      z.object({
        id: text(80).regex(/^[a-z0-9-]+$/),
        name: text(100),
        type: text(120),
        year: text(4).regex(/^\d{4}$/),
        kind: z.enum(['notes', 'timer', 'image']),
        description: text(1000),
        detail: text(10000),
        stack: z.array(text(40)).max(12),
        image: z.union([image, z.literal('')]).default(''),
        url: link,
      }),
    )
    .max(20)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      'Project IDs must be unique.',
    ),
  keepsakes: z
    .array(
      z.object({
        id: text(80).regex(/^[a-z0-9-]+$/),
        label: text(80),
        title: text(45),
        image,
        alt: text(200),
        note: text(140),
      }),
    )
    .max(3)
    .refine(
      (items) => new Set(items.map((item) => item.id)).size === items.length,
      'Paper IDs must be unique.',
    ),
})
export function parseInput(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    const issue = result.error.issues[0]
    const error = new Error(
      `${issue.path.join('.') || 'Input'}: ${issue.message}`,
    )
    error.status = 400
    throw error
  }
  return result.data
}
