/**
 * Pinterest entity типы
 * @layer entities
 */

export interface PinterestPin {
  id: string
  title?: string
  description?: string
  link: string
  media?: {
    images?: {
      [key: string]: {
        url: string
        width: number
        height: number
      }
    }
  }
  board?: {
    id: string
    name: string
  }
  created_at: string
  isSaved?: boolean // Флаг, что пин уже сохранен как гайд
}

export interface PinterestPinsResponse {
  items: PinterestPin[]
  bookmark?: string | null // Для пагинации
  total?: number
}

export interface PinterestPinsParams {
  pageSize?: number
  bookmark?: string
}

export interface SavePinAsGuideRequest {
  imageUrl: string
  title: string
  text?: string
  link: string
  tags?: string[]
  approved?: boolean
}