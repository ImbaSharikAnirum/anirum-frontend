/**
 * Guide API client
 * @layer entities
 */

import { BaseAPI } from '@/shared/api'
import type {
  Guide,
  GuidesResponse,
  CreateGuideRequest,
  SearchGuidesRequest,
  ToggleSaveRequest,
  PopularTag
} from '../model/types'

export class GuideAPI extends BaseAPI {
  private readonly basePath = '/guides'

  /**
   * Получить все гайды с пагинацией
   */
  async getGuides(params?: { page?: number; pageSize?: number }): Promise<GuidesResponse> {
    const { page = 1, pageSize = 20 } = params || {}

    const searchParams = new URLSearchParams({
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': 'image,users_permissions_user,savedBy'
    })

    const response = await this.request<GuidesResponse>(`${this.basePath}?${searchParams}`)

    return response
  }

  /**
   * Получить гайд по ID
   */
  async getGuide(id: string): Promise<{ data: Guide }> {
    return this.request<{ data: Guide }>(`${this.basePath}/${id}?populate=image,users_permissions_user,savedBy`)
  }

  /**
   * Создать новый гайд
   */
  async createGuide(data: CreateGuideRequest): Promise<{ data: Guide }> {
    const formData = new FormData()

    formData.append('data', JSON.stringify({
      title: data.title,
      text: data.text,
      link: data.link,
      tags: data.tags,
    }))

    if (data.image instanceof File) {
      formData.append('files.image', data.image)
    }

    const response = await fetch(`${this.baseURL}${this.basePath}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Ошибка при создании гайда')
    }

    return response.json()
  }

  /**
   * Обновить гайд
   */
  async updateGuide(id: string, data: Partial<CreateGuideRequest>): Promise<{ data: Guide }> {
    return this.request<{ data: Guide }>(`${this.basePath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    })
  }

  /**
   * Удалить гайд
   */
  async deleteGuide(id: string): Promise<void> {
    return this.request<void>(`${this.basePath}/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Поиск гайдов (через Next.js API route для корректной передачи пагинации)
   */
  async searchGuides(params: SearchGuidesRequest): Promise<GuidesResponse> {
    // Используем Next.js API route вместо прямого вызова Strapi
    const response = await fetch('/api/guides/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error?.error || 'Ошибка при поиске гайдов')
    }

    return response.json()
  }

  /**
   * Сохранить/убрать гайд из сохраненных
   */
  async toggleSave(id: string, data: ToggleSaveRequest): Promise<{ data: Guide }> {
    return this.request<{ data: Guide }>(`${this.basePath}/${id}/toggle-save`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Получить популярные теги
   */
  async getPopularTags(): Promise<PopularTag[]> {
    return this.request<PopularTag[]>(`${this.basePath}/popular-tags`)
  }

  /**
   * Получить гайды пользователя
   */
  async getUserGuides(userId: string, params?: { page?: number; pageSize?: number }): Promise<GuidesResponse> {
    const { page = 1, pageSize = 20 } = params || {}

    const searchParams = new URLSearchParams({
      'filters[users_permissions_user][documentId][$eq]': userId,
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': 'image,savedBy'
    })

    return this.request<GuidesResponse>(`${this.basePath}?${searchParams}`)
  }

  /**
   * Получить сохраненные гайды пользователя
   */
  async getSavedGuides(userId: string, params?: { page?: number; pageSize?: number }): Promise<GuidesResponse> {
    const { page = 1, pageSize = 20 } = params || {}

    const searchParams = new URLSearchParams({
      'filters[savedBy][documentId][$eq]': userId,
      'pagination[page]': page.toString(),
      'pagination[pageSize]': pageSize.toString(),
      'populate': 'image,users_permissions_user'
    })

    return this.request<GuidesResponse>(`${this.basePath}?${searchParams}`)
  }
}

// Синглтон экземпляр
export const guideAPI = new GuideAPI()