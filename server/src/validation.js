export function validateMessage(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return { error: 'Please provide your name, email, and message.' }
  const fields = ['name', 'email', 'message']
  if (fields.some((field) => typeof body[field] !== 'string'))
    return { error: 'Please provide your name, email, and message as text.' }
  const data = Object.fromEntries(
    fields.map((field) => [field, body[field].trim()]),
  )
  if (!data.name || data.name.length > 100)
    return { error: 'Your name must be between 1 and 100 characters.' }
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { error: 'Please enter a valid email address.' }
  if (data.message.length < 10 || data.message.length > 5000)
    return { error: 'Your message must be between 10 and 5,000 characters.' }
  data.email = data.email.toLowerCase()
  return { data }
}
