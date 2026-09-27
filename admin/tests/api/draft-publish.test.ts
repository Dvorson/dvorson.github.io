/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import matter from 'gray-matter'
import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import { POST as draftHandler } from '../../src/app/api/draft/route'
import { POST as publishHandler } from '../../src/app/api/publish/route'

// Keys the site's posts collection accepts (site/src/content.config.ts).
const SITE_SCHEMA_KEYS = ['categories', 'description', 'draft', 'pubDate', 'tags', 'title']

function request(url: string, body: unknown) {
  return new NextRequest(`http://localhost:3001${url}`, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const validPost = {
  title: 'Published Test Post',
  description: 'A short summary.',
  content: 'This is published content',
  tags: ['test', 'publish'],
  category: 'AI Engineering',
}

describe('Draft and Publish API', () => {
  let postsDir: string

  beforeEach(async () => {
    postsDir = await fs.mkdtemp(path.join(os.tmpdir(), 'posts-'))
    process.env.POSTS_DIR = postsDir
  })

  afterEach(async () => {
    delete process.env.POSTS_DIR
    await fs.rm(postsDir, { recursive: true, force: true })
  })

  describe('publish', () => {
    it('writes front-matter the site content schema accepts', async () => {
      const response = await publishHandler(request('/api/publish', { ...validPost, slug: 'published-test-post' }))
      expect(response.status).toBe(200)

      const file = await fs.readFile(path.join(postsDir, 'published-test-post.md'), 'utf-8')
      const { data, content } = matter(file)
      expect(Object.keys(data).sort()).toEqual(SITE_SCHEMA_KEYS.filter((k) => k !== 'draft'))
      expect(data.title).toBe('Published Test Post')
      expect(data.categories).toEqual(['AI Engineering'])
      expect(String(data.pubDate)).toMatch(/^\d{4}-\d{2}-\d{2}/)
      expect(content.trim()).toBe('This is published content')
    })

    it('round-trips quotes and YAML-significant characters in the title', async () => {
      const title = 'He said "hi": a #1 post $(touch /tmp/pwned) & more'
      const response = await publishHandler(request('/api/publish', { ...validPost, title, slug: 'quoted' }))
      expect(response.status).toBe(200)

      const { data } = matter(await fs.readFile(path.join(postsDir, 'quoted.md'), 'utf-8'))
      expect(data.title).toBe(title)
    })

    it('derives the file name from the title when no slug is given', async () => {
      const response = await publishHandler(request('/api/publish', { ...validPost, title: 'Café Déjà Vu: Part 2!' }))
      expect(response.status).toBe(200)
      expect((await response.json()).path).toMatch(/cafe-deja-vu-part-2\.md$/)
    })

    it.each([
      ['../../escape'],
      ['nested/path'],
      ['UPPER'],
      ['with space'],
    ])('rejects unsafe slug %p without writing anything', async (slug) => {
      const response = await publishHandler(request('/api/publish', { ...validPost, slug }))
      expect(response.status).toBe(400)
      expect(await fs.readdir(postsDir)).toEqual([])
    })

    it.each([
      ['title', { ...validPost, title: '' }],
      ['content', { ...validPost, content: '   ' }],
      ['description', { ...validPost, description: '' }],
      ['category', { ...validPost, category: '' }],
    ])('rejects a post missing %s', async (_field, body) => {
      const response = await publishHandler(request('/api/publish', body))
      expect(response.status).toBe(400)
    })

    it('rejects malformed JSON with 400', async () => {
      const response = await publishHandler(request('/api/publish', '{not json'))
      expect(response.status).toBe(400)
    })
  })

  describe('draft', () => {
    it('saves drafts outside the published posts directory', async () => {
      const response = await draftHandler(request('/api/draft', { title: 'Draft', content: 'Body', tags: [], slug: 'my-draft' }))
      expect(response.status).toBe(200)

      expect(await fs.readdir(postsDir)).toEqual(['_drafts'])
      const { data } = matter(await fs.readFile(path.join(postsDir, '_drafts', 'my-draft.md'), 'utf-8'))
      expect(data.draft).toBe(true)
      expect(data.categories).toEqual(['Uncategorized'])
    })

    it('generates a file name when no slug is given', async () => {
      const response = await draftHandler(request('/api/draft', { title: 'Draft', content: 'Body', tags: [] }))
      expect((await response.json()).path).toMatch(/draft-\d+\.md$/)
    })

    it('rejects path traversal in the slug', async () => {
      const response = await draftHandler(request('/api/draft', { title: 'Draft', content: 'Body', tags: [], slug: '../x' }))
      expect(response.status).toBe(400)
    })
  })
})
