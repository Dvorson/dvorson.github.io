import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { parsePostData, postsDir, resolveSlug, serializePost, ValidationError } from '@/lib/frontmatter'

export type { PostData } from '@/types'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  try {
    const post = parsePostData(body, { requireDescription: false })
    const fileName = resolveSlug(post.slug, () => `draft-${Date.now()}`)

    // Drafts live in a subdirectory the site's content loader does not read.
    const draftsDir = path.join(postsDir(), '_drafts')
    await mkdir(draftsDir, { recursive: true })
    const filePath = path.join(draftsDir, `${fileName}.md`)
    await writeFile(filePath, serializePost(post, { draft: true }), 'utf-8')

    return NextResponse.json({ message: 'Draft saved successfully!', path: filePath })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Draft save error:', error)
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
  }
}
