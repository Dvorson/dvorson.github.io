import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The admin app writes posts into src/posts; keep this schema in sync with
// admin/src/lib/frontmatter.ts.
const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).min(1),
    draft: z.boolean().default(false),
  }).strict(),
});

// Long-form technical write-ups, one per case study; the file name is the
// case study slug in src/data/services.json.
const caseStudyWriteups = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/case-studies' }),
  schema: z.object({
    title: z.string(),
    updatedDate: z.coerce.date(),
  }).strict(),
});

export const collections = { posts, caseStudyWriteups };
