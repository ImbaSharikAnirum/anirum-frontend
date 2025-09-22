import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * API для сохранения Pinterest пина как гайда
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return Response.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pinterest/save-pin-as-guide`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      if (response.status === 401) {
        return Response.json(
          { error: 'Необходима авторизация' },
          { status: 401 }
        )
      }

      if (response.status === 400) {
        return Response.json(
          { error: errorData.error?.message || 'Неверные данные' },
          { status: 400 }
        )
      }

      console.error('Pinterest save pin API error:', errorData)
      return Response.json(
        { error: 'Ошибка при сохранении пина' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Pinterest save pin API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}