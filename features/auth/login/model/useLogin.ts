/**
 * Хук для обработки входа в систему
 * @layer features/auth
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, type LoginCredentials } from '@/entities/user'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useUser()
  const router = useRouter()

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      // Делаем запрос к Next.js API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важно для cookies
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(getErrorMessage(data, response.status))
        return
      }

      // Устанавливаем пользователя в store
      setUser(data.user)
      
      // Перенаправляем на главную страницу
      router.push('/')
      
    } catch (err) {
      console.error('Login error:', err)
      setError('Произошла неожиданная ошибка')
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

function getErrorMessage(data: any, status: number): string {
  switch (status) {
    case 400:
      return 'Неверный email или пароль'
    case 429:
      return 'Слишком много попыток. Попробуйте позже'
    case 500:
      return 'Ошибка сервера. Попробуйте позже'
    default:
      return data?.error || 'Произошла ошибка при входе'
  }
}