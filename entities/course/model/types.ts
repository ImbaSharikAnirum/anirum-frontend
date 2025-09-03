export interface Course {
  id: number
  description: string
  direction: string
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