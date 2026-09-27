import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { slugify } from '@/lib/frontmatter'
import { imagesDir, POST_IMAGE_URL_PREFIX } from '@/lib/images'
import { MAX_IMAGE_BYTES } from '@/lib/uploadImage'

// SVG is left out on purpose: it can carry script and would be served from the site origin.
const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

export async function POST(request: NextRequest) {
  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }
  const extension = EXTENSIONS[file.type]
  if (!extension) {
    return NextResponse.json({ error: 'Only PNG, JPEG, GIF, WebP, and AVIF images are supported' }, { status: 400 })
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  // The content hash keeps names unique and makes re-uploading the same image idempotent.
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 10)
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image'
  const fileName = `${base}-${hash}.${extension}`

  const dir = imagesDir()
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, fileName), bytes)

  return NextResponse.json({ src: `${POST_IMAGE_URL_PREFIX}${fileName}` })
}
