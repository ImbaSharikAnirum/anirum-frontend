'use client'

import { useUser } from '@/entities/user'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface GuestGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

/**
 * Компонент для страниц, доступных только гостям (неавторизованным)
 * @layer shared/ui
 */
export function GuestGuard({ 
  children, 
  redirectTo = '/' 
}: GuestGuardProps) {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  if (user) {
    return null
  }

  return <>{children}</>
}