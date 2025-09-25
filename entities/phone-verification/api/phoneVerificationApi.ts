/**
 * API для верификации номеров телефонов
 * @layer entities
 */

import { BaseAPI } from '@/shared/api/base'

interface SendCodeRequest {
  phone: string
  messenger: 'whatsapp' | 'telegram'
}

interface SendCodeResponse {
  success: boolean
  message: string
  phone: string
}

interface VerifyCodeRequest {
  phone: string
  code: string
}

interface VerifyCodeResponse {
  success: boolean
  message: string
  verified: boolean
  messenger: string
}

interface VerificationStatusResponse {
  whatsapp_verified: boolean
  telegram_verified: boolean
  active_codes: number
}

export class PhoneVerificationAPI extends BaseAPI {
  /**
   * Отправить код верификации
   */
  async sendCode(data: SendCodeRequest): Promise<SendCodeResponse> {
    return this.request('/phone-verification/send-code', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Проверить код верификации
   */
  async verifyCode(data: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    return this.request('/phone-verification/verify-code', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Получить статус верификации
   */
  async getStatus(): Promise<VerificationStatusResponse> {
    return this.request('/phone-verification/status')
  }
}

export const phoneVerificationAPI = new PhoneVerificationAPI()