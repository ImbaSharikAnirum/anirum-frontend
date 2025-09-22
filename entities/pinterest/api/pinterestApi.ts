/**
 * Pinterest API client
 * @layer entities
 */

import { BaseAPI } from '@/shared/api/base'
import type {
  PinterestPinsResponse,
  PinterestPinsParams,
  SavePinAsGuideRequest
} from '../model/types'

export class PinterestAPI extends BaseAPI {
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
   * Сохранение пина как гайда
   */
  async savePinAsGuide(data: SavePinAsGuideRequest): Promise<void> {
    const response = await fetch('/api/guides/save-pinterest', {
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
}

// Синглтон экземпляр
export const pinterestAPI = new PinterestAPI()