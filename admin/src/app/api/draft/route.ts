import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export interface PostData {
  title: string
  content: string
  tags: string[]
  category: string
  slug?: string
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as PostData
    const { slug, title, tags, category, content } = data
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    // Create the directory structure
    const siteDir = path.join(process.cwd(), '..', 'site')
    const srcDir = path.join(siteDir, 'src')
    const postsDir = path.join(srcDir, 'posts')
    const draftsDir = path.join(postsDir, '_drafts')
    
    // Ensure directories exist
    await mkdir(draftsDir, { recursive: true })
    
    // Generate filename
    const fileName = slug || `draft-${Date.now()}`
    const filePath = path.join(draftsDir, `${fileName}.md`)
    
    // Create frontmatter
    const frontmatter = [
      '---',
      `title: "${title}"`,
      `date: "${new Date().toISOString()}"`,
      `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]`,
      `category: "${category || 'Uncategorized'}"`,
      'draft: true',
      '---',
      '',
      content
    ].join('\n')
    
    // Write the file
    await writeFile(filePath, frontmatter, 'utf-8')
    
    return NextResponse.json({
      message: 'Draft saved successfully!',
      path: filePath
    })
    
  } catch (error) {
    console.error('Draft save error:', error)
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}