import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Creations API routes
 * Стандартный proxy к Strapi с поддержкой фильтров
 * @layer app
 */

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/creations${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error('Creations API error:', await response.text())
      return Response.json(
        { error: 'Ошибка при получении креативов' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Creations API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
