/**
 * Guide entity типы
 * @layer entities
 */

export interface Guide {
  id: number // Numeric ID из Strapi
  documentId: string
  title: string
  text?: string
  link?: string
  tags?: string[]
  approved: boolean
  createdAt: string
  updatedAt: string
  creationsCount?: number // Количество креативов (для популярных гайдов)
  image?: {
    id: string
    url: string
    alternativeText?: string
    formats?: {
      thumbnail?: { url: string }
      small?: { url: string }
      medium?: { url: string }
      large?: { url: string }
    }
  }
  users_permissions_user?: {
    id: string
    username: string
    email: string
  }
  savedBy?: Array<{
    id: string
  }>
}

export interface GuidesResponse {
  data: Guide[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface CreateGuideRequest {
  title: string
  text?: string
  link?: string
  tags?: string[]
  image?: File | string
}

export interface SearchGuidesRequest {
  query?: string
  tags?: string[]
  userId?: string
  page?: number
  pageSize?: number
}

export interface ToggleSaveRequest {
  action: 'save' | 'unsave'
}

export interface PopularTag {
  tag: string
  count: number
}