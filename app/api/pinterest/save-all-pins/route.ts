import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * API для массового сохранения всех пинов как гайдов
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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/pinterest/save-all-pins`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

      if (response.status === 403) {
        return Response.json(
          { error: errorData.error?.message || 'Доступно только для менеджеров' },
          { status: 403 }
        )
      }

      if (response.status === 400) {
        return Response.json(
          { error: errorData.error?.message || 'Неверные данные' },
          { status: 400 }
        )
      }

      console.error('Pinterest save all pins API error:', errorData)
      return Response.json(
        { error: 'Ошибка при массовом сохранении пинов' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Pinterest save all pins API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
