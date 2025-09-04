export interface Course {
  id: number
  documentId: string // Strapi 5 добавляет documentId
  description: string
  direction: 'sketching' | 'drawing2d' | 'animation' | 'modeling3d'
  status?: 'pending_approval' | 'approved'
  startTime: string
  endTime: string
  startDate: string
  endDate: string
  timezone: string
  pricePerLesson: number
  currency: string
  country: string
  city: string
  address: string
  isOnline: boolean
  minStudents: number
  maxStudents: number
  startAge: number | null
  endAge: number | null
  complexity: 'beginner' | 'experienced' | 'professional'
  courseType: 'club' | 'course' | 'intensive' | 'individual'
  language: string
  inventoryRequired: boolean
  inventoryDescription: string
  rentalPrice: number | null
  software: string
  weekdays: string[]
  googlePlaceId?: string
  coordinates?: { lat: number; lng: number } | null
  images?: (string | Media)[] // Поддержка и строк, и Strapi 5 медиа файлов
  teacher?: User // Связанный преподаватель
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface Media {
  id: number
  documentId: string
  name: string
  url: string
  width: number
  height: number
  size: number
  mime: string
  alternativeText?: string
  caption?: string
  formats?: {
    thumbnail?: MediaFormat
    small?: MediaFormat
    medium?: MediaFormat
    large?: MediaFormat
  }
}

export interface MediaFormat {
  url: string
  width: number
  height: number
  size: number
}

export interface User {
  id: number
  documentId: string
  username: string
  name: string
  family: string
  email: string
  avatar?: (string | Media)
  firstName?: string
  lastName?: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCourseData {
  description: string
  direction: string
  teacher: number | null
  startTime: string
  endTime: string
  startDate: Date | undefined
  endDate: Date | undefined
  timezone: string
  pricePerLesson: string
  currency: string
  country: string
  city: string
  address: string
  isOnline: boolean | undefined
  minStudents: number
  maxStudents: number
  startAge: string
  endAge: string
  complexity: string
  courseType: string
  language: string
  inventoryRequired: boolean
  inventoryDescription: string
  rentalPrice: string
  software: string
  googlePlaceId?: string
  coordinates?: { lat: number; lng: number } | null
}