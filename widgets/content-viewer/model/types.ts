/**
 * Content Viewer унифицированные типы
 * @layer widgets/content-viewer
 */

export interface UnifiedContent {
  id: string
  title: string
  description?: string
  imageUrl: string
  link?: string
  tags?: string[]
  author?: string
}

export type ContentType = 'pin' | 'guide'
