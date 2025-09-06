/**
 * Хранилище состояния пользователя
 * @layer entities/user
 */

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, UpdateUserData } from './types'

interface UserStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  updateUser: (data: UpdateUserData) => Promise<void>
}

const UserContext = createContext<UserStore | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Загружаем токен из localStorage при инициализации
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('jwt')
      if (savedToken) {
        setToken(savedToken)
        try {
          // Загружаем данные пользователя с сервера
          const { userAuthAPI } = await import('../api/auth')
          const userData = await userAuthAPI.getCurrentUser(savedToken)
          setUser(userData)
        } catch (error) {
          // Если токен недействителен, очищаем его
          console.error('Invalid token:', error)
          localStorage.removeItem('jwt')
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const setAuth = (userData: User, tokenValue: string) => {
    setUser(userData)
    setToken(tokenValue)
    localStorage.setItem('jwt', tokenValue)
  }

  const clearAuth = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('jwt')
  }

  const setLoadingState = (loading: boolean) => {
    setIsLoading(loading)
  }

  const updateUserData = async (data: UpdateUserData) => {
    if (!user || !token) {
      throw new Error('Пользователь не авторизован')
    }

    try {
      // Импортируем API и обновляем данные на сервере
      const { userAuthAPI } = await import('../api/auth')
      const updatedUser = await userAuthAPI.updateUser(user.id, data, token)
      
      // Обновляем локальное состояние
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  const store: UserStore = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    
    setAuth,
    clearAuth,
    setLoading: setLoadingState,
    updateUser: updateUserData,
  }

  return (
    <UserContext.Provider value={store}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}