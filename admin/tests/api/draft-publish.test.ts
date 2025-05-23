import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { POST as draftHandler } from '../../src/app/api/draft/route'
import { POST as publishHandler } from '../../src/app/api/publish/route'
import * as fs from 'fs/promises'
import * as path from 'path'

describe('Draft and Publish API', () => {
  const testDir = path.join(process.cwd(), 'test-posts')
  const draftsDir = path.join(testDir, '_drafts')
  
  beforeEach(async () => {
    // Create test directories
    await fs.mkdir(draftsDir, { recursive: true })
  })
  
  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      // Ignore cleanup errors
    }
  })

  describe('Draft API', () => {
    it('should save draft with valid data', async () => {
      const postData = {
        title: 'Test Draft Post',
        content: 'This is test content',
        tags: ['test', 'draft'],
        category: 'Development',
        slug: 'test-draft-post'
      }

      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await draftHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Draft saved successfully!')
      expect(data.path).toContain('test-draft-post.md')

      // Verify file was created
      const filePath = path.join(draftsDir, 'test-draft-post.md')
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false)
      expect(fileExists).toBe(true)

      // Verify file content
      const fileContent = await fs.readFile(filePath, 'utf-8')
      expect(fileContent).toContain('title: "Test Draft Post"')
      expect(fileContent).toContain('draft: true')
      expect(fileContent).toContain('This is test content')
    })

    it('should generate slug when not provided', async () => {
      const postData = {
        title: 'Auto Generated Slug',
        content: 'Content for auto slug',
        tags: ['auto'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await draftHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.path).toMatch(/draft-\d+\.md$/)
    })

    it('should reject request with missing title', async () => {
      const postData = {
        content: 'Content without title',
        tags: ['test'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await draftHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
    })

    it('should reject request with missing content', async () => {
      const postData = {
        title: 'Title without content',
        tags: ['test'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await draftHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and content are required')
    })

    it('should handle special characters in title and content', async () => {
      const postData = {
        title: 'Test with "quotes" & <tags>',
        content: 'Content with ñ, émojis 🎉 and symbols €$£',
        tags: ['unicode', 'special'],
        category: 'Testing'
      }

      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await draftHandler(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      const filePath = data.path
      const fileContent = await fs.readFile(filePath, 'utf-8')
      
      expect(fileContent).toContain('Test with "quotes" & <tags>')
      expect(fileContent).toContain('Content with ñ, émojis 🎉 and symbols €$£')
    })

    it('should create directories if they don\'t exist', async () => {
      // Remove test directory first
      await fs.rm(testDir, { recursive: true, force: true })

      const postData = {
        title: 'Test Directory Creation',
        content: 'Testing auto directory creation',
        tags: ['test'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await draftHandler(request)
      expect(response.status).toBe(200)

      // Verify directories were created
      const dirExists = await fs.access(draftsDir).then(() => true).catch(() => false)
      expect(dirExists).toBe(true)
    })
  })

  describe('Publish API', () => {
    it('should publish post with valid data', async () => {
      const postData = {
        title: 'Published Test Post',
        content: 'This is published content',
        tags: ['published', 'test'],
        category: 'Development',
        slug: 'published-test-post'
      }

      const request = new NextRequest('http://localhost:3001/api/publish', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await publishHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Post published successfully!')

      // Verify file was created in main posts directory
      const filePath = path.join(testDir, 'published-test-post.md')
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false)
      expect(fileExists).toBe(true)

      // Verify file content doesn't have draft flag
      const fileContent = await fs.readFile(filePath, 'utf-8')
      expect(fileContent).toContain('title: "Published Test Post"')
      expect(fileContent).not.toContain('draft: true')
      expect(fileContent).toContain('This is published content')
    })

    it('should generate filename from title when slug not provided', async () => {
      const postData = {
        title: 'Auto Generated Post Name',
        content: 'Content for auto generation',
        tags: ['auto'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/publish', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await publishHandler(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.path).toMatch(/post-\d+\.md$/)
    })

    it('should include publication date in frontmatter', async () => {
      const postData = {
        title: 'Date Test Post',
        content: 'Testing date inclusion',
        tags: ['date'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/publish', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await publishHandler(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      const fileContent = await fs.readFile(data.path, 'utf-8')
      
      // Check that date is in ISO format
      expect(fileContent).toMatch(/date: "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"/)
    })

    it('should reject invalid post data', async () => {
      const postData = {
        content: 'Content without required fields'
      }

      const request = new NextRequest('http://localhost:3001/api/publish', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await publishHandler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing required fields')
    })

    it('should handle publishing with rich content including markdown', async () => {
      const postData = {
        title: 'Rich Content Post',
        content: `# Heading 1
        
## Heading 2

This is **bold** and *italic* text.

- List item 1
- List item 2

\`\`\`javascript
console.log('Hello world');
\`\`\`

[Link to Google](https://google.com)

![Image alt text](https://example.com/image.jpg)`,
        tags: ['markdown', 'rich-content'],
        category: 'Development'
      }

      const request = new NextRequest('http://localhost:3001/api/publish', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await publishHandler(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      const fileContent = await fs.readFile(data.path, 'utf-8')
      
      expect(fileContent).toContain('# Heading 1')
      expect(fileContent).toContain('**bold**')
      expect(fileContent).toContain('```javascript')
      expect(fileContent).toContain('[Link to Google]')
    })

    it('should handle empty tags array', async () => {
      const postData = {
        title: 'No Tags Post',
        content: 'Post without tags',
        tags: [],
        category: 'General'
      }

      const request = new NextRequest('http://localhost:3001/api/publish', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await publishHandler(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      const fileContent = await fs.readFile(data.path, 'utf-8')
      
      expect(fileContent).toContain('tags: []')
    })

    it('should sanitize filename from title', async () => {
      const postData = {
        title: 'Post with/Special\\Characters:And*Symbols?',
        content: 'Testing filename sanitization',
        tags: ['test'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/publish', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await publishHandler(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.path).not.toMatch(/[\/\\:*?"<>|]/)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: '{"invalid": json}',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await draftHandler(request)
      expect(response.status).toBe(500)

      const data = await response.json()
      expect(data.error).toContain('Failed to save draft')
    })

    it('should handle file system permission errors', async () => {
      // Mock fs.writeFile to throw an error
      const originalWriteFile = fs.writeFile
      fs.writeFile = jest.fn().mockRejectedValue(new Error('Permission denied'))

      const postData = {
        title: 'Permission Test',
        content: 'Testing permission error',
        tags: ['test'],
        category: 'Test'
      }

      const request = new NextRequest('http://localhost:3001/api/draft', {
        method: 'POST',
        body: JSON.stringify(postData)
      })

      const response = await draftHandler(request)
      expect(response.status).toBe(500)

      // Restore original function
      fs.writeFile = originalWriteFile
    })
  })
})