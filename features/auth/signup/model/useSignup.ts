/**
 * Хук для обработки регистрации пользователя
 * @layer features/auth
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, type RegisterCredentials } from '@/entities/user'

export function useSignup() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useUser()
  const router = useRouter()

  const signup = async (credentials: RegisterCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      // Делаем запрос к Next.js API route
      const response = await fetch('/api/auth/register', {
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
      console.error('Signup error:', err)
      setError('Произошла неожиданная ошибка')
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

function getErrorMessage(data: any, status: number): string {
  const message = data?.error?.message || data?.error || ''
  
  switch (status) {
    case 400:
      if (message.includes('email')) {
        return 'Пользователь с таким email уже существует'
      }
      if (message.includes('username')) {
        return 'Пользователь с таким именем уже существует'  
      }
      return 'Проверьте правильность введенных данных'
    case 429:
      return 'Слишком много попыток. Попробуйте позже'
    case 500:
      return 'Ошибка сервера. Попробуйте позже'
    default:
      return message || 'Произошла ошибка при регистрации'
  }
}