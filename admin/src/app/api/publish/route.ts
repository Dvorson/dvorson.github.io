import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

export interface PostData {
  title: string
  content: string
  tags: string[]
  category: string
  slug?: string
}

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as PostData
    const { slug, title, tags, category, content } = data
    
    // Validate required fields
    if (!title || !tags || !category || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Create the directory structure
    const siteDir = path.join(process.cwd(), '..', 'site')
    const srcDir = path.join(siteDir, 'src')
    const postsDir = path.join(srcDir, 'posts')
    
    // Ensure directory exists
    await mkdir(postsDir, { recursive: true })
    
    // Generate filename
    const fileName = slug || sanitizeFilename(title) || `post-${Date.now()}`
    const filePath = path.join(postsDir, `${fileName}.md`)
    
    // Create frontmatter (without draft flag)
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `date: "${new Date().toISOString()}"`,
      `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]`,
      `category: "${category}"`,
      '---',
      '',
      content
    ].join('\n')
    
    // Write the file
    await writeFile(filePath, frontmatter, 'utf-8')
    
    // Git operations (only if not in test environment)
    if (!process.env.NODE_ENV?.includes('test')) {
      try {
        await execAsync(`git add "${filePath}"`, { cwd: path.dirname(filePath) })
        await execAsync(`git commit -m "Publish post: ${title}"`, { cwd: path.dirname(filePath) })
        await execAsync('git push', { cwd: path.dirname(filePath) })
      } catch (gitError) {
        console.warn('Git operations failed (this is expected in development):', gitError)
        // Don't fail the request if git operations fail
      }
    }
    
    return NextResponse.json({
      message: 'Post published successfully!',
      path: filePath
    })
    
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish post' },
      { status: 500 }
    )
  }
}