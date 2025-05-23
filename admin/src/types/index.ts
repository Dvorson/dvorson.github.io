export interface PostData {
  title: string
  content: string
  tags: string[]
  category: string
  slug?: string
}

export interface EditorBlock {
  id: string
  type: 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'table' | 'image' | 'video' | 'math'
  content: string
  attributes?: Record<string, any>
  children?: EditorBlock[]
}

export interface SlashCommand {
  id: string
  title: string
  description: string
  icon: string
  command: () => void
  keywords: string[]
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface ImageNode {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
  alignment?: 'left' | 'center' | 'right'
}

export interface VideoNode {
  src: string
  type: 'youtube' | 'vimeo' | 'file'
  caption?: string
  width?: number
  height?: number
}

export interface TableCell {
  content: string
  type: 'header' | 'cell'
}

export interface TableRow {
  cells: TableCell[]
}

export interface TableNode {
  rows: TableRow[]
  hasHeader: boolean
}

export interface MathNode {
  latex: string
  inline: boolean
}