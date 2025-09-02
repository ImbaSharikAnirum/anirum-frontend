/**
 * Хук для обработки регистрации пользователя
 * @layer features/auth
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { userAuthAPI, useUser, type RegisterCredentials } from '@/entities/user'
import { APIError } from '@/shared/api/base'

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setAuth } = useUser()
  const router = useRouter()

  const signup = async (credentials: RegisterCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await userAuthAPI.register(credentials)
      
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
    signup,
    isLoading,
    error,
  }
}

function getErrorMessage(error: APIError): string {
  switch (error.status) {
    case 400:
      if (error.message.includes('email')) {
        return 'Пользователь с таким email уже существует'
      }
      if (error.message.includes('username')) {
        return 'Пользователь с таким именем уже существует'  
      }
      return 'Проверьте правильность введенных данных'
    case 429:
      return 'Слишком много попыток. Попробуйте позже'
    case 500:
      return 'Ошибка сервера. Попробуйте позже'
    default:
      return error.message || 'Произошла ошибка при регистрации'
  }
}