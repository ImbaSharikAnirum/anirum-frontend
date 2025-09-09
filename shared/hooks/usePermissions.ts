'use client'

import { useUser } from '@/entities/user'
import type { UserRoleName } from '@/entities/user/model/types'

/**
 * Хук для проверки разрешений пользователя
 * @layer shared/hooks
 */
export function usePermissions() {
  const { user } = useUser()

  const hasRole = (requiredRole: UserRoleName): boolean => {
    const userRoleName = user?.role?.name
    return userRoleName === requiredRole
  }

  const hasAnyRole = (requiredRoles: UserRoleName[]): boolean => {
    if (!user?.role?.name) return false
    const userRoleName = user.role.name
    return requiredRoles.includes(userRoleName)
  }

  const canCreateCourses = (): boolean => {
    return hasAnyRole(['Teacher', 'Manager'])
  }

  const canManageUsers = (): boolean => {
    return hasRole('Manager')
  }

  const canAccessDashboard = (): boolean => {
    return hasAnyRole(['Teacher', 'Manager'])
  }

  const isManagerValue = hasRole('Manager')
  const isTeacherValue = hasRole('Teacher')
  const isStudentValue = hasRole('Student')
  const isStaffValue = hasAnyRole(['Teacher', 'Manager'])
  const isAuthenticatedValue = !!user

  return {
    user,
    isAuthenticated: isAuthenticatedValue,
    userRole: user?.role?.name,
    
    // Алиасы для совместимости с useRole
    role: user?.role,
    roleName: user?.role?.name,
    
    // Общие проверки
    hasRole,
    hasAnyRole,
    
    // Специфичные разрешения
    canCreateCourses,
    canManageUsers,
    canAccessDashboard,
    
    // Проверки ролей - как булевы значения для совместимости
    isManager: isManagerValue,
    isTeacher: isTeacherValue, 
    isStudent: isStudentValue,
    isStaff: isStaffValue,
    
    // Функциональные версии для новых компонентов
    checkIsManager: () => isManagerValue,
    checkIsTeacher: () => isTeacherValue,
    checkIsStudent: () => isStudentValue,
    checkIsStaff: () => isStaffValue,
  }
}

// Алиас для совместимости с существующим кодом
export const useRole = usePermissions