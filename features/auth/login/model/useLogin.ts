/**
 * Хук для обработки входа в систему
 * @layer features/auth
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { userAuthAPI, useUser, type LoginCredentials } from '@/entities/user'
import { APIError } from '@/shared/api/base'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setAuth } = useUser()
  const router = useRouter()

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await userAuthAPI.login(credentials)
      
      // Сохраняем данные пользователя в store
      setAuth(response.user, response.jwt)
      
      // Перенаправляем на главную страницу
      router.push('/')
      
    } catch (err) {
      if (err instanceof APIError) {
        setError(getErrorMessage(err))
      } else {
        setError('Произошла неожиданная ошибка')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    login,
    isLoading,
    error,
  }
}

function getErrorMessage(error: APIError): string {
  switch (error.status) {
    case 400:
      return 'Неверный email или пароль'
    case 429:
      return 'Слишком много попыток. Попробуйте позже'
    case 500:
      return 'Ошибка сервера. Попробуйте позже'
    default:
      return error.message || 'Произошла ошибка при входе'
  }
}