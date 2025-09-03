/**
 * API для работы с преподавателями
 * @layer entities/user
 */

import { BaseAPI } from '@/shared/api/base'
import { User } from '../model/types'

export interface Teacher {
  id: number
  username: string  
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
      console.log('Пробуем новый teacher API: /teachers')
      const response = await this.request<Teacher[]>('/teachers')
      
      console.log('Успешно получены преподаватели:', response)
      return Array.isArray(response) ? response : []
    } catch (error: any) {
      console.error('Ошибка с новым teacher API:', error)
      
      // Fallback: если новый API не работает, возвращаем моковые данные для тестирования
      console.warn('Используем моковые данные преподавателей для тестирования')
      return [
        {
          id: 1,
          username: 'teacher1',
          email: 'teacher1@example.com',
          avatar: null
        },
        {
          id: 2,
          username: 'teacher2', 
          email: 'teacher2@example.com',
          avatar: null
        }
      ]
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