import { put, del } from '@vercel/blob'

const DATA_URL_RE = /^data:image\/(png|jpeg|jpg|webp);base64,([a-zA-Z0-9+/]+={0,2})$/

/**
 * Uploads raw image bytes to Vercel Blob and returns the public URL.
 * `folder` groups uploads for readability in the Blob dashboard (e.g. 'covers', 'avatars', 'scenes').
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  contentType: string,
  folder: string
): Promise<string> {
  const ext = contentType.split('/')[1] ?? 'jpg'
  const { url } = await put(`${folder}/${crypto.randomUUID()}.${ext}`, buffer, {
    access: 'public',
    contentType,
    addRandomSuffix: false,
  })
  return url
}

/**
 * Decodes a validated `data:image/...;base64,...` URL and uploads it to Vercel Blob.
 * Returns null if the input isn't a well-formed image data URL.
 */
export async function uploadDataUrlToBlob(dataUrl: string, folder: string): Promise<string | null> {
  const match = DATA_URL_RE.exec(dataUrl)
  if (!match) return null
  const contentType = `image/${match[1]}`
  const buffer = Buffer.from(match[2], 'base64')
  return uploadImageBuffer(buffer, contentType, folder)
}

/** Deletes a previously uploaded blob. Safe to call on a non-blob URL (e.g. Unsplash) — it's a no-op then. */
export async function deleteBlobImage(url: string | null | undefined): Promise<void> {
  if (!url || !url.includes('.blob.vercel-storage.com/')) return
  try {
    await del(url)
  } catch (e) {
    console.error('Failed to delete blob:', e)
  }
}
