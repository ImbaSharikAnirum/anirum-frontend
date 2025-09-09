/**
 * Утилиты для серверной аутентификации
 * @layer shared/lib
 */

import { cookies } from 'next/headers'
import type { User } from '@/entities/user/model/types'

/**
 * Получение пользователя на сервере через прямой доступ к cookies
 * Используется в layout.tsx для SSR
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return null
    }

    // Делаем запрос к Strapi напрямую с сервера
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const user = await response.json()
    return user
  } catch (error) {
    console.error('Failed to get server user:', error)
    return null
  }
}

/**
 * Получение пользователя на клиенте через API route
 */
export async function getClientUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include', // Важно для отправки cookies
    })

    if (!response.ok) {
      return null
    }

    const { user } = await response.json()
    return user
  } catch (error) {
    console.error('Failed to get client user:', error)
    return null
  }
}