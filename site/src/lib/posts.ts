import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const postUrl = (post: Post) => `/blog/${post.id}`;

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function formatDate(date: Date, month: 'short' | 'long' = 'short'): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month, day: 'numeric', timeZone: 'UTC' });
}
