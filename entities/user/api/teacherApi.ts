/**
 * API для работы с преподавателями
 * @layer entities/user
 */

import { BaseAPI } from '@/shared/api/base'
import { User } from '../model/types'

export interface Teacher {
  id: number
  documentId?: string  // Strapi 5 documentId
  username: string
  name?: string
  family?: string  
  email: string
  avatar?: {
    url: string
    alternativeText?: string
  } | null
}

export class TeacherAPI extends BaseAPI {
  /**
   * Получить список всех преподавателей через безопасный endpoint
   */
  async getTeachers(): Promise<Teacher[]> {
    try {
      const response = await this.request<Teacher[]>('/teachers')
      
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error('Ошибка при загрузке преподавателей:', error)
      throw error
    }
  }

  /**
   * Получить преподавателя по ID через безопасный endpoint
   */
  async getTeacherById(id: number): Promise<Teacher | null> {
    try {
      return await this.request<Teacher>(`/teachers/${id}`)
    } catch (error: any) {
      if (error.status === 404) {
        return null
      }
      console.error('Ошибка при получении преподавателя:', error)
      return null
    }
  }
}

// Экспортируем экземпляр API
export const teacherAPI = new TeacherAPI()

// Удобные функции для обратной совместимости
export const getTeachers = () => teacherAPI.getTeachers()
export const getTeacherById = (id: number) => teacherAPI.getTeacherById(id)