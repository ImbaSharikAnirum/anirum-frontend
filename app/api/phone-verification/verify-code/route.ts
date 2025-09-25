import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cookieStore = await cookies()

    // Получаем JWT токен из cookies
    const jwt = cookieStore.get('session')?.value

    if (!jwt) {
      return NextResponse.json(
        { error: { message: 'Необходима авторизация' } },
        { status: 401 }
      )
    }

    // Проксируем запрос к Strapi
    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/phone-verification/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
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