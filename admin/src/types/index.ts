export interface PostData {
  title: string
  /** One-sentence summary; required to publish (used for meta description). */
  description: string
  content: string
  tags: string[]
  category: string
  slug?: string
}
