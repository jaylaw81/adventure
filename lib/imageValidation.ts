const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,([a-zA-Z0-9+/]+={0,2})$/

const MAX_DECODED_BYTES = 4 * 1024 * 1024 // 4MB — client resizes well below this before upload

/**
 * Validates a client-supplied base64 image data URL (upload or hand-drawn canvas export).
 * Returns the data URL unchanged when valid, or null when it's malformed, an unsupported
 * type, or too large. Never trust client-side size limits alone.
 */
export function validateImageDataUrl(dataUrl: unknown): string | null {
  if (typeof dataUrl !== 'string') return null
  const match = DATA_URL_RE.exec(dataUrl)
  if (!match) return null

  const base64 = match[2]
  const decodedBytes = Math.floor((base64.length * 3) / 4)
  if (decodedBytes > MAX_DECODED_BYTES || decodedBytes === 0) return null

  return dataUrl
}
