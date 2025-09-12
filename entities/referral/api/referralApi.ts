/**
 * API для работы с реферальной системой
 * @layer entities/referral
 */

import { BaseAPI } from '@/shared/api/base'
import type { 
  ReferralCode, 
  ValidateCodeRequest, 
  ValidateCodeResponse, 
  MyReferralCodeResponse, 
  ReferralStats 
} from '../model/types'

export class ReferralAPI extends BaseAPI {
  constructor() {
    // Используем /api как базовый путь для Next.js API routes
    super('/api')
  }

  /**
   * Валидация реферального кода
   */
  async validateCode(request: ValidateCodeRequest): Promise<ValidateCodeResponse> {
    return this.request<ValidateCodeResponse>('/referral-codes/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  /**
   * Получение собственного реферального кода
   * Если кода нет, то создается новый
   */
  async getMyCode(): Promise<MyReferralCodeResponse> {
    return this.request<MyReferralCodeResponse>('/referral-codes/my')
  }

  /**
   * Получение статистики по рефералам
   */
  async getStats(): Promise<ReferralStats> {
    return this.request<ReferralStats>('/referral-codes/stats')
  }

  /**
   * Получение списка реферальных кодов (для админки)
   */
  async getReferralCodes(params?: {
    page?: number
    pageSize?: number
    filters?: Record<string, any>
  }): Promise<{ data: ReferralCode[], meta: any }> {
    const searchParams = new URLSearchParams()
    
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString())
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        searchParams.append(`filters[${key}]`, String(value))
      })
    }

    return this.request<{ data: ReferralCode[], meta: any }>(
      `/referral-codes?${searchParams}`
    )
  }

  /**
   * Создание нового реферального кода (для админки)
   */
  async createReferralCode(data: Partial<ReferralCode>): Promise<ReferralCode> {
    return this.request<ReferralCode>('/referral-codes', {
      method: 'POST',
      body: JSON.stringify({ data }),
    })
  }
}

// Экспорт экземпляра API
export const referralAPI = new ReferralAPI()