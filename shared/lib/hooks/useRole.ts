/**
 * Хук для проверки ролей пользователя
 * @layer shared
 */

'use client'

import { useUser } from '@/entities/user'

export function useRole() {
  const { user } = useUser()

  const hasRole = (roleName: string) => {
    return user?.role?.name === roleName
  }

  const hasAnyRole = (roleNames: string[]) => {
    return user?.role?.name ? roleNames.includes(user.role.name) : false
  }

  return {
    user,
    role: user?.role,
    roleName: user?.role?.name,
    
    // Проверки конкретных ролей
    isManager: hasRole('Manager'),
    isTeacher: hasRole('Teacher'),
    isAuthenticated: hasRole('Authenticated'),
    
    // Проверки групп ролей
    isStaff: hasAnyRole(['Manager', 'Teacher']), // Менеджер или Преподаватель
    
    // Универсальные методы
    hasRole,
    hasAnyRole,
  }
}