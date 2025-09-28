import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      )
    }

    // Проксируем запрос к Strapi
    const strapiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api'

    const response = await fetch(`${strapiUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Ошибка при отправке запроса' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Ссылка для восстановления пароля отправлена на ваш email'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}