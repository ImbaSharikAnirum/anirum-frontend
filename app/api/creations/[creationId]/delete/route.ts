/**
 * API Route для удаления креатива
 * DELETE /api/creations/[creationId]/delete
 * @layer app/api
 */

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ creationId: string }> }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return Response.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    const { creationId } = await context.params

    if (!creationId) {
      return Response.json(
        { error: 'Creation ID is required' },
        { status: 400 }
      )
    }

    // Удаляем креатив через Strapi API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/creations/${creationId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Strapi error response:', errorText)
      return Response.json(
        { error: 'Failed to delete creation' },
        { status: response.status }
      )
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting creation:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
