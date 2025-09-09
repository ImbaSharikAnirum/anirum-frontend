/**
 * API для работы со студентами
 * @layer entities/student
 */

import { BaseAPI } from '@/shared/api/base'
import type { Student, CreateStudentData, UpdateStudentData } from '../model/types'
import type { User } from '@/entities/user/model/types'

export class StudentAPI extends BaseAPI {
  /**
   * Получить всех студентов текущего пользователя
   */
  async getMyStudents(userId?: number): Promise<Student[]> {
    let currentUserId = userId;
    
    // Если ID пользователя не передан, получаем его
    if (!currentUserId) {
      const currentUser = await fetch('/api/users/me')
      if (!currentUser.ok) {
        throw new Error('Failed to get current user')
      }
      const user = await currentUser.json()
      currentUserId = user.id;
    }

    // Фильтруем студентов по owner
    const response = await fetch(`/api/students?filters[owner][id][$eq]=${currentUserId}&populate=owner&sort=createdAt:desc`)
    if (!response.ok) {
      throw new Error('Failed to fetch students')
    }
    
    const data = await response.json()
    return data.data
  }

  /**
   * Получить студента по ID
   */
  async getStudent(id: number): Promise<Student> {
    const response = await fetch(`/api/students/${id}?populate=owner`)
    if (!response.ok) {
      throw new Error('Failed to fetch student')
    }
    
    const data = await response.json()
    return data.data
  }

  /**
   * Создать нового студента
   */
  async createStudent(data: CreateStudentData, userId?: number): Promise<Student> {
    let currentUserId = userId;
    
    // Если ID пользователя не передан, получаем его
    if (!currentUserId) {
      const currentUser = await fetch('/api/users/me')
      if (!currentUser.ok) {
        throw new Error('Failed to get current user')
      }
      const user = await currentUser.json()
      currentUserId = user.id;
    }

    // Добавляем owner к данным студента
    const studentData = {
      ...data,
      owner: currentUserId
    }

    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: studentData }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create student')
    }
    
    const result = await response.json()
    return result.data
  }

  /**
   * Обновить студента
   */
  async updateStudent(documentId: string, data: UpdateStudentData): Promise<Student> {
    const response = await fetch(`/api/students/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to update student')
    }
    
    const result = await response.json()
    console.log('Update response:', result) // Отладка
    return result.data
  }

  /**
   * Удалить студента
   */
  async deleteStudent(documentId: string): Promise<void> {
    const response = await fetch(`/api/students/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `HTTP error! status: ${response.status}`)
    }

    // DELETE запрос может вернуть пустой ответ, не пытаемся парсить JSON
  }
}

// Экспортируем экземпляр API
export const studentAPI = new StudentAPI()