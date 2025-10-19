/**
 * Creation API client
 * @layer entities
 */

import { BaseAPI } from '@/shared/api/base'
import type { Creation, UploadCreationRequest, CreationsResponse } from '../model/types'
import type { PinterestPin } from '@/entities/pinterest'

export class CreationAPI extends BaseAPI {
  /**
   * Загрузка пользовательского изображения по Pinterest пину
   * Паттерн как в courseAPI: сначала upload изображения, потом создание creation
   */
  async uploadCreation(file: File, pin: PinterestPin): Promise<Creation> {
    try {
      // Шаг 1: Загрузить изображение через /api/upload (как в courseAPI)
      const formData = new FormData()
      formData.append('files', file, file.name)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Ошибка загрузки изображения')
      }

      const uploadedFiles = await uploadResponse.json()
      const imageId = uploadedFiles[0].id

      // Получаем URL оригинального изображения пина из Pinterest API
      const pinImageUrl = pin.media?.images?.['1200x']?.url ||
                          pin.media?.images?.['736x']?.url ||
                          Object.values(pin.media?.images || {})[0]?.url

      if (!pinImageUrl) {
        throw new Error('URL изображения пина не найден')
      }

      // Шаг 2: Создать Creation (проверка Guide + генерация тегов на backend)
      const requestData: UploadCreationRequest = {
        imageId,
        pinterest_id: pin.id,
        pinTitle: pin.title || 'Pinterest Pin',
        pinLink: `https://www.pinterest.com/pin/${pin.id}/`,
        pinImageUrl, // ← Передаём URL оригинального изображения пина
      }

      const response = await fetch('/api/creations/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Ошибка создания creation')
      }

      const data = await response.json()
      return data.creation
    } catch (error) {
      console.error('Upload creation error:', error)
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
      throw new Error(`Ошибка загрузки изображения: ${message}`)
    }
  }

  /**
   * Получение моих creations
   */
  async getMyCreations(): Promise<CreationsResponse> {
    return this.request<CreationsResponse>('/creations/my')
  }

  /**
   * Получение креативов по гайду
   * Используем стандартные Strapi 5 фильтры
   * @param guideId - ID гайда
   * @param excludeUserId - ID пользователя, чьи креативы нужно исключить (опционально)
   */
  async getCreationsByGuide(guideId: string, excludeUserId?: string): Promise<CreationsResponse> {
    const params = new URLSearchParams({
      'filters[guide][documentId][$eq]': guideId,
      'populate[0]': 'image',
      'populate[1]': 'guide',
      'populate[2]': 'users_permissions_user',
      'sort[0]': 'createdAt:desc',
    })

    // Исключаем креативы определенного пользователя (если указан)
    if (excludeUserId) {
      params.set('filters[users_permissions_user][documentId][$ne]', excludeUserId)
    }

    const response = await fetch(`/api/creations?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Ошибка при получении креативов')
    }

    return response.json()
  }

  /**
   * Получение моих креативов по конкретному гайду
   */
  async getMyCreationsByGuide(guideId: string, userId: string): Promise<CreationsResponse> {
    const params = new URLSearchParams({
      'filters[guide][documentId][$eq]': guideId,
      'filters[users_permissions_user][documentId][$eq]': userId,
      'populate[0]': 'image',
      'populate[1]': 'guide',
      'populate[2]': 'users_permissions_user',
      'sort[0]': 'createdAt:desc',
    })

    const response = await fetch(`/api/creations?${params.toString()}`)

    if (!response.ok) {
      throw new Error('Ошибка при получении моих креативов')
    }

    return response.json()
  }
}

// Синглтон экземпляр
export const creationAPI = new CreationAPI()
