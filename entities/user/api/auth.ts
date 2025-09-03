/**
 * API для работы с аутентификацией пользователей
 * @layer entities/user
 */

import { BaseAPI } from '@/shared/api/base'
import type { 
  User, 
  AuthSession, 
  LoginCredentials, 
  RegisterCredentials, 
  ForgotPasswordData, 
  ResetPasswordData 
} from '../model/types'

export class UserAuthAPI extends BaseAPI {
  /**
   * Авторизация пользователя
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    return this.request<AuthSession>('/auth/local', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  /**
   * Регистрация пользователя
   */
  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    return this.request<AuthSession>('/auth/local/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser(token: string): Promise<User> {
    return this.request<User>('/users/me?populate=role', {
      headers: this.getAuthHeaders(token),
    })
  }

  /**
   * Запрос на восстановление пароля
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ ok: boolean }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Сброс пароля
   */
  async resetPassword(data: ResetPasswordData): Promise<AuthSession> {
    return this.request<AuthSession>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Экспортируем экземпляр API

export const userAuthAPI = new UserAuthAPI()