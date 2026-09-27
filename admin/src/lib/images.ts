import path from 'path'

/** Public URL prefix for images uploaded from the editor. */
export const POST_IMAGE_URL_PREFIX = '/img/posts/'

export function imagesDir(): string {
  return process.env.IMAGES_DIR ?? path.join(process.cwd(), '..', 'site', 'public', 'img', 'posts')
}

/** Files under imagesDir() that a post body references, so publish can commit them with the post. */
export function referencedImagePaths(content: string): string[] {
  const escaped = POST_IMAGE_URL_PREFIX.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
  const names = new Set<string>()
  for (const match of content.matchAll(new RegExp(`${escaped}([a-z0-9-]+\\.[a-z]+)`, 'g'))) {
    names.add(match[1])
  }
  return [...names].map((name) => path.join(imagesDir(), name))
}
