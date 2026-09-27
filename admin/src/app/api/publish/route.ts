import { NextRequest, NextResponse } from 'next/server'
import { access, writeFile, mkdir } from 'fs/promises'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { parsePostData, postsDir, resolveSlug, serializePost, slugify, ValidationError } from '@/lib/frontmatter'
import { referencedImagePaths } from '@/lib/images'

export type { PostData } from '@/types'

const execFileAsync = promisify(execFile)

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
  }

  try {
    const post = parsePostData(body, { requireDescription: true })
    const fileName = resolveSlug(post.slug, () => slugify(post.title) || `post-${Date.now()}`)

    const dir = postsDir()
    await mkdir(dir, { recursive: true })
    const filePath = path.join(dir, `${fileName}.md`)
    await writeFile(filePath, serializePost(post, { draft: false }), 'utf-8')

    if (!process.env.NODE_ENV?.includes('test')) {
      // Arguments go straight to git, never through a shell, so a title
      // containing quotes or $(...) is just text in the commit message.
      try {
        // Images uploaded from the editor ship in the same commit as the post.
        const images = []
        for (const image of referencedImagePaths(post.content)) {
          if (await access(image).then(() => true, () => false)) images.push(image)
        }
        const paths = [filePath, ...images]
        await execFileAsync('git', ['add', '--', ...paths], { cwd: dir })
        await execFileAsync('git', ['commit', '-m', `Publish post: ${post.title}`, '--', ...paths], { cwd: dir })
        await execFileAsync('git', ['push'], { cwd: dir })
      } catch (gitError) {
        console.warn('Git operations failed (this is expected in development):', gitError)
      }
    }

    return NextResponse.json({ message: 'Post published successfully!', path: filePath })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('Publish error:', error)
    return NextResponse.json({ error: 'Failed to publish post' }, { status: 500 })
  }
}
