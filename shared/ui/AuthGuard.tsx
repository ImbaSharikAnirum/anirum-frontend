'use client'

import { useUser } from '@/entities/user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

/**
 * Компонент для защиты страниц, требующих аутентификации
 * @layer shared/ui
 */
export function AuthGuard({ 
  children, 
  fallback = null, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  if (!user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}