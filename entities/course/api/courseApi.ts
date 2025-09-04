import { BaseAPI } from '@/shared/api/base'
import { Course, CreateCourseData } from '../model/types'

interface StrapiResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface StrapiSingleResponse<T> {
  data: T
  meta: {}
}

export class CourseAPI extends BaseAPI {
  /**
   * Получение списка курсов с фильтрацией и пагинацией
   */
  async getCourses(params?: {
    page?: number
    pageSize?: number
    sort?: string[]
    filters?: Record<string, any>
    populate?: string[]
  }): Promise<{ courses: Course[], meta: any }> {
    const searchParams = new URLSearchParams()
    
    // Пагинация
    if (params?.page) searchParams.append('pagination[page]', params.page.toString())
    if (params?.pageSize) searchParams.append('pagination[pageSize]', params.pageSize.toString())
    
    // Сортировка
    if (params?.sort) {
      params.sort.forEach((sortField, index) => {
        searchParams.append(`sort[${index}]`, sortField)
      })
    }
    
    // Фильтры
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(`filters[${key}][$eq]`, value.toString())
        }
      })
    }
    
    // Популяция связанных данных (изображения, преподаватель)
    const populate = params?.populate || ['images', 'teacher']
    populate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field)
    })

    const queryString = searchParams.toString()
    const endpoint = `/courses?populate[0]=images&populate[1]=teacher.avatar`
    
    const response = await this.request<StrapiResponse<Course>>(endpoint)
    
    return {
      courses: response.data,
      meta: response.meta
    }
  }

  /**
   * Получение курса по documentId (Strapi 5)
   */
  async getCourse(documentId: string, populate?: string[]): Promise<Course> {
    const searchParams = new URLSearchParams()
    
    const defaultPopulate = populate || ['images', 'teacher.avatar']
    defaultPopulate.forEach((field, index) => {
      searchParams.append(`populate[${index}]`, field)
    })

    const queryString = searchParams.toString()
    const endpoint = `/courses/${documentId}?populate[0]=images&populate[1]=teacher.avatar`
    
    const response = await this.request<StrapiSingleResponse<Course>>(endpoint)
    return response.data
  }

  /**
   * Загрузка изображений в Strapi 5
   */
  async uploadImages(files: File[], token: string): Promise<number[]> {
    if (files.length === 0) return []

    const form = new FormData()
    files.forEach(file => {
      form.append('files', file, file.name)
    })

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: form
    })

    if (!response.ok) {
      throw new Error('Ошибка при загрузке изображений')
    }

    const uploadedFiles = await response.json()
    return uploadedFiles.map((file: any) => file.id)
  }

  /**
   * Создание курса
   */
  async createCourse(formData: CreateCourseData, selectedDays: string[], token: string, imageFiles?: File[]): Promise<Course> {
    // Шаг 1: Загрузить изображения (если есть)
    let imageIds: number[] = []
    if (imageFiles && imageFiles.length > 0) {
      imageIds = await this.uploadImages(imageFiles, token)
    }

  // Шаг 2: Создать курс с привязанными изображениями
  const courseData = {
    data: {
      description: formData.description,
      direction: formData.direction,
      teacher: formData.teacher,
      startTime: formData.startTime ? `${formData.startTime}:00.000` : null,
      endTime: formData.endTime ? `${formData.endTime}:00.000` : null,
      startDate: formData.startDate ? formData.startDate.toISOString().split('T')[0] : null,
      endDate: formData.endDate ? formData.endDate.toISOString().split('T')[0] : null,
      timezone: formData.timezone,
      pricePerLesson: parseFloat(formData.pricePerLesson) || 0,
      currency: formData.currency,
      country: formData.country,
      city: formData.city,
      address: formData.address,
      isOnline: formData.isOnline ?? false,
      minStudents: formData.minStudents,
      maxStudents: formData.maxStudents,
      startAge: parseInt(formData.startAge) || null,
      endAge: parseInt(formData.endAge) || null,
      complexity: formData.complexity,
      courseType: formData.courseType,
      language: formData.language,
      inventoryRequired: formData.inventoryRequired,
      inventoryDescription: formData.inventoryDescription,
      rentalPrice: parseFloat(formData.rentalPrice) || null,
      software: formData.software,
      weekdays: selectedDays,
      googlePlaceId: formData.googlePlaceId,
      coordinates: formData.coordinates,
      images: imageIds // Привязать загруженные изображения
    }
  }

    return this.request<{ data: Course }>('/courses', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(courseData)
    }).then(result => result.data)
  }
}

// Экспортируем экземпляр API
export const courseAPI = new CourseAPI()