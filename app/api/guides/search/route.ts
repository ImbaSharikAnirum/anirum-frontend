import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Search guides API route
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guides/search`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Search guides API error:', errorData)
      return Response.json(
        { error: errorData.error?.message || 'Ошибка при поиске гайдов' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Search guides API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}