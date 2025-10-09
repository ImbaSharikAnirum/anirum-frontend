/**
 * Pinterest utilities для SSR
 * @layer shared/lib
 */

import { cookies } from 'next/headers'

interface PinterestStatus {
  isConnected: boolean
  message: string
}

/**
 * Получает статус Pinterest подключения на сервере
 * Аналогично getServerUser()
 */
export async function getServerPinterestStatus(): Promise<PinterestStatus | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      console.log('❌ No token found')
      return { isConnected: false, message: 'Необходима авторизация' }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pinterest/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Не используем cache в SSR для актуальных данных
      cache: 'no-store'
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { isConnected: false, message: 'Необходима авторизация' }
      }
      // При ошибке возвращаем null, чтобы показать fallback UI
      return null
    }

    const data = await response.json()
    return data

  } catch (error) {
    console.error('Pinterest status check error:', error)
    // При ошибке возвращаем null, чтобы показать fallback UI
    return null
  }
}