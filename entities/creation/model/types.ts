/**
 * Creation entity типы
 * @layer entities
 */

export interface Creation {
  id: string
  documentId: string
  pinterest_id: string
  image: {
    id: number
    url: string
    alternativeText?: string
    formats?: {
      thumbnail?: { url: string }
      small?: { url: string }
      medium?: { url: string }
      large?: { url: string }
    }
  }
  users_permissions_user: {
    id: string
    documentId: string
    username: string
  }
  guide: {
    id: string
    documentId: string
    title: string
    link?: string
    image?: {
      id: number
      url: string
      alternativeText?: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface UploadCreationRequest {
  imageId: number
  pinterest_id: string
  pinTitle: string
  pinLink: string
  pinImageUrl: string // URL оригинального изображения пина из Pinterest API
}

export interface CreationsResponse {
  data: Creation[]
  meta: {
    total: number
  }
}
