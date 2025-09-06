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
  async getMyStudents(token: string, userId?: number): Promise<Student[]> {
    let currentUserId = userId;
    
    // Если ID пользователя не передан, получаем его
    if (!currentUserId) {
      const currentUser = await this.request<User>('/users/me', {
        headers: this.getAuthHeaders(token),
      })
      currentUserId = currentUser.id;
    }

    // Фильтруем студентов по owner
    return this.request<{ data: Student[] }>(`/students?filters[owner][id][$eq]=${currentUserId}&populate=owner&sort=createdAt:desc`, {
      headers: this.getAuthHeaders(token),
    }).then(response => response.data)
  }

  /**
   * Получить студента по ID
   */
  async getStudent(id: number, token: string): Promise<Student> {
    return this.request<{ data: Student }>(`/students/${id}?populate=owner`, {
      headers: this.getAuthHeaders(token),
    }).then(response => response.data)
  }

  /**
   * Создать нового студента
   */
  async createStudent(data: CreateStudentData, token: string, userId?: number): Promise<Student> {
    let currentUserId = userId;
    
    // Если ID пользователя не передан, получаем его
    if (!currentUserId) {
      const currentUser = await this.request<User>('/users/me', {
        headers: this.getAuthHeaders(token),
      })
      currentUserId = currentUser.id;
    }

    // Добавляем owner к данным студента
    const studentData = {
      ...data,
      owner: currentUserId
    }

    return this.request<{ data: Student }>('/students', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ data: studentData }),
    }).then(response => response.data)
  }

  /**
   * Обновить студента
   */
  async updateStudent(documentId: string, data: UpdateStudentData, token: string): Promise<Student> {
    console.log('Updating student:', { documentId, data }) // Отладка
    return this.request<{ data: Student }>(`/students/${documentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ data }),
    }).then(response => {
      console.log('Update response:', response) // Отладка
      return response.data
    })
  }

  /**
   * Удалить студента
   */
  async deleteStudent(documentId: string, token: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/students/${documentId}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(token),
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