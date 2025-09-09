import { Invoice } from '@/entities/invoice'

export interface Course {
  id: number
  documentId: string // Strapi 5 добавляет documentId
  description: string
  direction: 'sketching' | 'drawing2d' | 'animation' | 'modeling3d'
  status?: 'pending_approval' | 'approved'
  startTime: string
  endTime: string
  normalizedStartTime?: string // Время в московской зоне для фильтрации
  normalizedEndTime?: string   // Время в московской зоне для фильтрации  
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
  currentStudents?: number // Текущее количество записанных студентов
  enrollmentStatus?: 'booking' | 'active' | 'completed' // Статус записи на курс
  startAge: number | null
  endAge: number | null
  complexity: 'beginner' | 'experienced' | 'professional'
  courseType: 'club' | 'course' | 'intensive' | 'individual'
  language: string
  inventoryRequired: boolean
  inventoryDescription: string
  rentalPrice: number | null
  software: string
  urlMessenger?: string
  weekdays: string[]
  googlePlaceId?: string
  coordinates?: { lat: number; lng: number } | null
  images?: (string | Media)[] // Поддержка и строк, и Strapi 5 медиа файлов
  teacher?: User // Связанный преподаватель
  invoices?: Invoice[] // Связанные счета
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
  teacher: string | null // documentId пользователя
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
  urlMessenger?: string
  googlePlaceId?: string
  coordinates?: { lat: number; lng: number } | null
}

export interface UpdateCourseData extends CreateCourseData {
  // Может содержать дополнительные поля специфичные для обновления
}