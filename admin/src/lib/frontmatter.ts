import matter from 'gray-matter'
import path from 'path'
import type { PostData } from '@/types'

// Front-matter must satisfy the posts collection schema in
// site/src/content.config.ts, or the site build fails.

export class ValidationError extends Error {}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** A caller-supplied slug must already be a plain slug; it becomes a file name. */
export function resolveSlug(slug: string | undefined, fallback: () => string): string {
  if (slug) {
    if (!SLUG_PATTERN.test(slug)) {
      throw new ValidationError('Slug may only contain lowercase letters, digits, and single hyphens')
    }
    return slug
  }
  return fallback()
}

export function postsDir(): string {
  return process.env.POSTS_DIR ?? path.join(process.cwd(), '..', 'site', 'src', 'posts')
}

export function parsePostData(value: unknown, { requireDescription }: { requireDescription: boolean }): PostData {
  if (typeof value !== 'object' || value === null) throw new ValidationError('Request body must be a JSON object')
  const data = value as Record<string, unknown>

  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const content = typeof data.content === 'string' ? data.content : ''
  const description = typeof data.description === 'string' ? data.description.trim() : ''
  const category = typeof data.category === 'string' ? data.category.trim() : ''
  const tags = Array.isArray(data.tags) ? data.tags : []

  if (!title) throw new ValidationError('Title is required')
  if (!content.trim()) throw new ValidationError('Content is required')
  if (requireDescription && !description) throw new ValidationError('Description is required')
  if (requireDescription && !category) throw new ValidationError('Category is required')
  if (!tags.every((tag): tag is string => typeof tag === 'string')) throw new ValidationError('Tags must be strings')
  if (data.slug !== undefined && typeof data.slug !== 'string') throw new ValidationError('Slug must be a string')

  return {
    title,
    description,
    content,
    category,
    tags: tags.map((tag) => tag.trim()).filter(Boolean),
    slug: (data.slug as string | undefined) || undefined,
  }
}

export function serializePost(post: PostData, { draft, now = new Date() }: { draft: boolean; now?: Date }): string {
  const body = post.content.endsWith('\n') ? post.content : `${post.content}\n`
  return matter.stringify(`\n${body}`, {
    title: post.title,
    description: post.description,
    pubDate: now.toISOString().slice(0, 10),
    tags: post.tags,
    categories: [post.category || 'Uncategorized'],
    ...(draft && { draft: true }),
  })
}
