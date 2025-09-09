import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface RegisterRequest {
  username: string
  email: string
  password: string
}

export async function POST(request: Request) {
  try {
    const { username, email, password }: RegisterRequest = await request.json()

    // Делаем запрос к Strapi для регистрации
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    })

    const authData = await authResponse.json()
    
    if (!authResponse.ok) {
      return NextResponse.json(authData, { status: authResponse.status })
    }

    const { jwt, user } = authData

    // Получаем полные данные пользователя с ролью
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=role`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    })

    const userWithRole = await userResponse.json()

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    // Устанавливаем HttpOnly cookie с JWT
    const cookieStore = await cookies()
    cookieStore.set('session', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    })

    // Возвращаем только данные пользователя (без JWT)
    return NextResponse.json({ user: userWithRole })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}