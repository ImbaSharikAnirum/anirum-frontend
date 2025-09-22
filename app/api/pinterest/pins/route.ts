import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Pinterest Pins API Route
 * Прокси к Strapi Pinterest API для получения пинов
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Передаем все query параметры к Strapi
    const strapiParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      strapiParams.append(key, value)
    })

    const queryString = strapiParams.toString()
    const url = `${process.env.NEXT_PUBLIC_API_URL}/pinterest/pins${queryString ? `?${queryString}` : ''}`

    const headers = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      headers,
      cache: 'no-store', // Pinterest данные должны быть актуальными
    })

    if (!response.ok) {
      const errorText = await response.text()

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Pinterest не подключен или токен недействителен' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: 'Ошибка при получении пинов', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Pinterest pins API error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}