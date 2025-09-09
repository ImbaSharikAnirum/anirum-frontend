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
  ResetPasswordData,
  UpdateUserData
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
  async getCurrentUser(): Promise<User> {
    const response = await fetch('/api/users/me?populate=role')
    
    if (!response.ok) {
      throw new Error('Failed to get current user')
    }
    
    return response.json()
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

  /**
   * Обновление профиля пользователя
   */
  async updateUser(data: UpdateUserData): Promise<User> {
    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to update user')
    }

    return response.json()
  }
}

// Экспортируем экземпляр API

export const userAuthAPI = new UserAuthAPI()