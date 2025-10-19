import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Guides API routes
 */

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    const { searchParams } = new URL(request.url)

    // Показываем все документы независимо от статуса (draft и published)
    searchParams.set('status', 'draft,published')

    const queryString = searchParams.toString()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/guides${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error('Guides API error:', await response.text())
      return Response.json(
        { error: 'Ошибка при получении гайдов' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Guides API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

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

    const formData = await request.formData()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guides`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Create guide API error:', errorData)
      return Response.json(
        { error: errorData.error?.message || 'Ошибка при создании гайда' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Create guide API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}