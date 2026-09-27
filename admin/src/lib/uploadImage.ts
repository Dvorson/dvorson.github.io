export const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/**
 * Uploads an image into the site's public folder and returns the path to use
 * in post content. Blob URLs would stop working as soon as the tab closes.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('File size must be less than 10MB')
  }

  const body = new FormData()
  body.append('file', file)
  const response = await fetch('/api/images', { method: 'POST', body })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || typeof data.src !== 'string') {
    throw new Error(data.error ?? 'Image upload failed')
  }
  return data.src
}
