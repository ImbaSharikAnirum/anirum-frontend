import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('📤 Frontend API route - тело запроса:', body)

    const cookieStore = await cookies()

    // Получаем JWT токен из cookies
    const jwt = cookieStore.get('session')?.value
    console.log('🔑 JWT токен найден:', !!jwt)

    if (!jwt) {
      console.error('❌ JWT токен не найден в cookies')
      return NextResponse.json(
        { error: { message: 'Необходима авторизация' } },
        { status: 401 }
      )
    }

    // Проксируем запрос к Strapi
    console.log('🔄 Отправка к Strapi:', `${process.env.NEXT_PUBLIC_API_URL}/phone-verification/send-code`)

    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/phone-verification/send-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    })

    const data = await strapiResponse.json()
    console.log('📥 Ответ от Strapi:', { status: strapiResponse.status, data })

    if (!strapiResponse.ok) {
      console.error('❌ Strapi вернул ошибку:', data)
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