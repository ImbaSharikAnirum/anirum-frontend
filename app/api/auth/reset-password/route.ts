import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, password, passwordConfirmation } = body

    // Валидация
    if (!code || !password || !passwordConfirmation) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      )
    }

    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { error: 'Пароли не совпадают' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проксируем запрос к Strapi
    const strapiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api'

    const response = await fetch(`${strapiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        password,
        passwordConfirmation,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Ошибка при сбросе пароля' },
        { status: response.status }
      )
    }

    // Если сброс успешен и пользователь авторизован, устанавливаем cookie
    if (data.jwt) {
      const { jwt, user } = data

      // Получаем полные данные пользователя с ролью
      const userResponse = await fetch(`${strapiUrl}/users/me?populate=role`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
        },
      })

      const userWithRole = await userResponse.json()

      if (!userResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
      }

      const cookieStore = await cookies()
      cookieStore.set('session', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 дней
      })

      return NextResponse.json({
        success: true,
        message: 'Пароль успешно изменен',
        user: userWithRole
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}