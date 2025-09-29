/**
 * API route для копирования счетов на следующий месяц
 * @layer app/api
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/shared/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const user = await getServerUser()
    if (!user) {
      return NextResponse.json(
        { error: { message: 'Необходима авторизация' } },
        { status: 401 }
      )
    }

    // Проверяем роль пользователя
    if (user.role?.name !== 'Manager') {
      return NextResponse.json(
        { error: { message: 'Только менеджеры могут копировать счета' } },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { courseId, currentMonth, currentYear } = body

    if (!courseId || !currentMonth || !currentYear) {
      return NextResponse.json(
        { error: { message: 'Необходимо указать courseId, currentMonth и currentYear' } },
        { status: 400 }
      )
    }

    // Получаем токен из cookies для авторизации к Strapi
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json(
        { error: { message: 'Токен авторизации не найден' } },
        { status: 401 }
      )
    }

    // Пересылаем запрос к Strapi
    const strapiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/copy-to-next-month`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ courseId, currentMonth, currentYear })
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
    console.error('❌ Ошибка в copy-to-next-month API route:', error)
    return NextResponse.json(
      { error: { message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    )
  }
}