import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Pinterest Connection Status API Route
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return Response.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const strapiUrl = `${process.env.NEXT_PUBLIC_API_URL}/pinterest/status`
    console.log('🔍 Pinterest Status API Route Debug:')
    console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    console.log('  Final Strapi URL:', strapiUrl)

    const response = await fetch(strapiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    console.log('📡 Strapi Status Response:', response.status)

    const data = await response.json()
    console.log('📊 Strapi Status Data:', data)

    return Response.json({
      status: response.status,
      isConnected: data.isConnected || false,
      message: data.message || 'Неизвестный статус',
      ...data
    })

  } catch (error) {
    console.error('Pinterest status API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}