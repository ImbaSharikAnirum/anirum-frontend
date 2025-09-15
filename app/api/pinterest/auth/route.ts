import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json(
        { error: { message: 'Необходима авторизация' } },
        { status: 401 }
      )
    }

    // Получаем текущего пользователя
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: { message: 'Пользователь не найден' } },
        { status: 401 }
      )
    }

    const user = await userResponse.json()
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: { message: 'Code is required' } },
        { status: 400 }
      )
    }

    // Вызываем Strapi API для Pinterest авторизации
    const pinterestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pinterest/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // ✅ Добавляем авторизацию
      },
      body: JSON.stringify({
        code,
        userId: user.documentId,
      }),
    })

    const pinterestData = await pinterestResponse.json()

    if (!pinterestResponse.ok) {
      return NextResponse.json(
        { error: pinterestData.error || { message: 'Ошибка при подключении Pinterest' } },
        { status: pinterestResponse.status }
      )
    }

    return NextResponse.json(pinterestData)

  } catch (error) {
    console.error('Pinterest auth error:', error)
    return NextResponse.json(
      { error: { message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    )
  }
}