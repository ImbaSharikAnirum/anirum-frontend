/**
 * Pinterest API client
 * @layer entities
 */

import { BaseAPI } from '@/shared/api/base'
import type {
  PinterestPin,
  PinterestPinsResponse,
  PinterestPinsParams,
  SavePinAsGuideRequest
} from '../model/types'

export class PinterestAPI extends BaseAPI {
  /**
   * Получение конкретного пина по ID
   */
  async getPinById(pinId: string): Promise<PinterestPin | null> {
    try {
      const response = await fetch(`/api/pinterest/pins/${pinId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error('Ошибка при получении пина')
      }

      const data = await response.json()
      return data.pin || null
    } catch (error) {
      console.error('Ошибка получения пина по ID:', error)
      return null
    }
  }

  /**
   * Получение пинов пользователя с пагинацией
   */
  async getPins(params: PinterestPinsParams = {}): Promise<PinterestPinsResponse> {
    const { pageSize = 50, bookmark } = params

    const searchParams = new URLSearchParams({
      page_size: pageSize.toString(),
      ...(bookmark && { bookmark }),
    })

    const response = await fetch(`/api/pinterest/pins?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Pinterest не подключен')
      }
      throw new Error('Ошибка при получении пинов')
    }

    return response.json()
  }

  /**
   * Загрузка изображений как в courseApi
   */
  async uploadImages(files: File[]): Promise<number[]> {
    if (files.length === 0) return []

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file, file.name)
    })

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Ошибка при загрузке изображений')
    }

    const uploadedFiles = await response.json()
    return uploadedFiles.map((file: any) => file.id)
  }

  /**
   * Загрузка Pinterest изображения через прокси (как в courseApi)
   */
  async uploadPinterestImage(imageUrl: string): Promise<{ id: number }> {
    try {
      // Используем корректный CORS прокси для бинарных данных
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`

      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Не удалось загрузить изображение`)
      }

      // Получаем бинарные данные изображения напрямую
      const blob = await response.blob()

      // Проверяем что это действительно изображение
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Неверный тип файла: ${blob.type}`)
      }

      const fileName = `pinterest-pin-${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`
      const file = new File([blob], fileName, { type: blob.type })

      // Загружаем точно как в courseApi
      const formData = new FormData()
      formData.append('files', file, file.name)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      const uploadedFiles = await uploadResponse.json()

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('No files uploaded')
      }

      return { id: uploadedFiles[0].id }

    } catch (error) {
      console.error('Pinterest image upload error:', error)
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
      throw new Error(`Ошибка загрузки изображения: ${message}`)
    }
  }

  /**
   * Сохранение пина как гайда (с готовым imageId)
   */
  async savePinAsGuide(data: SavePinAsGuideRequest): Promise<void> {
    const response = await fetch('/api/pinterest/save-pin-as-guide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Ошибка при сохранении пина')
    }
  }

  /**
   * Массовое сохранение всех пинов как гайдов (только для менеджеров)
   */
  async saveAllPins(): Promise<{
    success: boolean
    results: {
      success: Array<{ pinId: string; guideId: string; tagsCount: number }>
      skipped: Array<{ pinId: string; reason: string; guideId: string }>
      errors: Array<{ pinId: string; error: string }>
    }
    summary: {
      total: number
      saved: number
      skipped: number
      errors: number
    }
  }> {
    const response = await fetch('/api/pinterest/save-all-pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Необходима авторизация')
      }
      if (response.status === 403) {
        throw new Error('Доступно только для менеджеров')
      }
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Ошибка при массовом сохранении пинов')
    }

    return response.json()
  }
}

// Синглтон экземпляр
export const pinterestAPI = new PinterestAPI()