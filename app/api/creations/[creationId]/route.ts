/**
 * API Route для получения креатива по ID
 * GET /api/creations/[creationId]
 * @layer app/api
 */

import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ creationId: string }> }
) {
  try {
    const { creationId } = await context.params

    if (!creationId) {
      return Response.json(
        { error: 'Creation ID is required' },
        { status: 400 }
      )
    }

    // Получаем креатив с полной информацией
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/creations?filters[documentId][$eq]=${creationId}&populate[0]=image&populate[1]=guide.image&populate[2]=users_permissions_user`,
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
        { error: 'Failed to fetch creation' },
        { status: response.status }
      )
    }

    const result = await response.json()

    // Проверяем, найден ли креатив
    if (!result.data || result.data.length === 0) {
      return Response.json(
        { error: 'Creation not found' },
        { status: 404 }
      )
    }

    return Response.json({ data: result.data[0] })
  } catch (error) {
    console.error('Error fetching creation:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
