'use client'

import { useUser } from '@/entities/user'
import type { UserRoleName } from '@/entities/user/model/types'
import { AccessDenied } from './AccessDenied'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRoleName[]
  fallback?: React.ReactNode
  accessDeniedTitle?: string
  accessDeniedMessage?: string
}

/**
 * Компонент для защиты контента по ролям
 * @layer shared/ui
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  accessDeniedTitle,
  accessDeniedMessage 
}: RoleGuardProps) {
  const { user } = useUser()

  // Если пользователь не загружен, показываем fallback
  if (!user) {
    return <>{fallback || null}</>
  }

  // Проверяем роль пользователя
  const userRole = user.role?.name
  const hasPermission = userRole && allowedRoles.includes(userRole)

  if (!hasPermission) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <AccessDenied 
        title={accessDeniedTitle}
        message={accessDeniedMessage}
      />
    )
  }

  return <>{children}</>
}