/**
 * Хранилище состояния пользователя
 * @layer entities/user
 */

'use client'

import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import type { User, UpdateUserData } from './types'

interface UserStore {
  user: User | null
  isAuthenticated: boolean
  
  // Кэшированные роли для оптимизации
  role: any | null
  roleName: string | null
  isManager: boolean
  isTeacher: boolean
  isStaff: boolean
  
  // Actions
  setUser: (user: User | null) => void
  clearAuth: () => void
  updateUser: (data: UpdateUserData) => Promise<void>
  
  // Role utilities
  hasRole: (roleName: string) => boolean
  hasAnyRole: (roleNames: string[]) => boolean
}

const UserContext = createContext<UserStore | null>(null)

interface UserProviderProps {
  children: ReactNode
  initialUser?: User | null
}

export function UserProvider({ children, initialUser = null }: UserProviderProps) {
  // Инициализируем состояние с данными с сервера (SSR)
  const [user, setUser] = useState<User | null>(initialUser)

  const clearAuth = async () => {
    // Очищаем локальное состояние сразу для быстрого отклика UI
    setUser(null)
    
    // Очищаем cookie сайдбара
    document.cookie = 'sidebar_state=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    // Вызываем API для удаления cookie с таймаутом
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 секунд таймаут
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Logout request timed out, but local state cleared')
      } else {
        console.error('Logout error:', error)
      }
      // Не показываем ошибку пользователю, так как локально уже вышли
    }
  }

  const updateUserData = async (data: UpdateUserData) => {
    if (!user) {
      throw new Error('Пользователь не авторизован')
    }

    try {
      // Делаем запрос через Next.js API route
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      const { user: updatedUser } = await response.json()
      setUser(updatedUser)
    } catch (error) {
      throw error
    }
  }

  // Мемоизированные вычисления ролей - пересчитываются только при изменении user
  const roleInfo = useMemo(() => {
    const role = user?.role || null
    const roleName = role?.name || null

    const hasRole = (targetRole: string) => roleName === targetRole
    const hasAnyRole = (roleNames: string[]) => roleName ? roleNames.includes(roleName) : false

    return {
      role,
      roleName,
      isManager: hasRole('Manager'),
      isTeacher: hasRole('Teacher'), 
      isStaff: hasAnyRole(['Manager', 'Teacher']),
      hasRole,
      hasAnyRole
    }
  }, [user])

  const store: UserStore = {
    user,
    isAuthenticated: !!user,
    
    // Кэшированные роли из useMemo
    role: roleInfo.role,
    roleName: roleInfo.roleName,
    isManager: roleInfo.isManager,
    isTeacher: roleInfo.isTeacher,
    isStaff: roleInfo.isStaff,
    
    // Actions
    setUser,
    clearAuth,
    updateUser: updateUserData,
    
    // Role utilities
    hasRole: roleInfo.hasRole,
    hasAnyRole: roleInfo.hasAnyRole,
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