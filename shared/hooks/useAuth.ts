/**
 * Хук для работы с аутентификацией пользователя
 * @layer shared/hooks
 */

'use client'

import { useState, useEffect } from 'react'
import { userAuthAPI } from '@/entities/user/api/auth'
import type { User } from '@/entities/user/model/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('jwt')
      if (!token) {
        setUser(null)
        return
      }

      const userData = await userAuthAPI.getCurrentUser(token)
      setUser(userData)
    } catch (err) {
      console.error('Auth check failed:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setUser(null)
      // Удаляем недействительный токен
      localStorage.removeItem('jwt')
    } finally {
      setIsLoading(false)
    }
  }

  const isAuthenticated = !!user
  const isManager = user?.role?.type === 'manager'
  const isTeacher = user?.role?.type === 'teacher'
  const isStudent = user?.role?.type === 'student'

  const logout = () => {
    localStorage.removeItem('jwt')
    setUser(null)
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isManager,
    isTeacher, 
    isStudent,
    checkAuth,
    logout
  }
}