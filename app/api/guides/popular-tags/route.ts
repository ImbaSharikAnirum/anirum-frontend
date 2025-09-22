import { NextRequest } from 'next/server'

/**
 * Popular tags API route
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/guides/popular-tags?limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error('Popular tags API error:', await response.text())
      return Response.json(
        { error: 'Ошибка при получении популярных тегов' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Popular tags API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}