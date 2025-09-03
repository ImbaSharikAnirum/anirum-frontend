import { BaseAPI } from '@/shared/api/base'
import { Course, CreateCourseData } from '../model/types'

export class CourseAPI extends BaseAPI {
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