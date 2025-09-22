import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Single guide API routes
 */

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/guides/${id}${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      console.error('Guide API error:', await response.text())
      return Response.json(
        { error: 'Ошибка при получении гайда' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Guide API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return Response.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guides/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Update guide API error:', errorData)
      return Response.json(
        { error: errorData.error?.message || 'Ошибка при обновлении гайда' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return Response.json(data)

  } catch (error) {
    console.error('Update guide API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return Response.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guides/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Delete guide API error:', errorData)
      return Response.json(
        { error: errorData.error?.message || 'Ошибка при удалении гайда' },
        { status: response.status }
      )
    }

    return Response.json({ success: true })

  } catch (error) {
    console.error('Delete guide API error:', error)
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}