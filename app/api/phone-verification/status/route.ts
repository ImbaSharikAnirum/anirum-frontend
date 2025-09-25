import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()

    // Получаем JWT токен из cookies
    const jwt = cookieStore.get('jwt')?.value

    if (!jwt) {
      return NextResponse.json(
        { error: { message: 'Необходима авторизация' } },
        { status: 401 }
      )
    }

    // Проксируем запрос к Strapi
    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/phone-verification/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    })

    const data = await strapiResponse.json()

    if (!strapiResponse.ok) {
      return NextResponse.json(
        { error: data },
        { status: strapiResponse.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: { message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    )
  }
}