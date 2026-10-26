export async function api(path, { method = 'GET', body, csrf, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    signal,
    headers: {
      ...(method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      ...(csrf ? { 'X-CSRF-Token': csrf } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(
      result.error || 'The service is unavailable. Please try again.',
    )
    error.status = response.status
    throw error
  }
  return result
}
