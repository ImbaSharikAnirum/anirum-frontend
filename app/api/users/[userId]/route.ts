/**
 * API Route для получения публичной информации о пользователе
 * GET /api/users/[userId]
 * @layer app/api
 */

import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params

    if (!userId) {
      return Response.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Получаем публичную информацию о пользователе
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users?filters[documentId][$eq]=${userId}&populate=role`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Strapi error response:', errorText)
      return Response.json(
        { error: 'Failed to fetch user' },
        { status: response.status }
      )
    }

    const users = await response.json()

    // Проверяем, найден ли пользователь
    if (!users || users.length === 0) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Возвращаем только публичные поля
    const publicUser = {
      id: user.id,
      documentId: user.documentId,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return Response.json(publicUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
