import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface RouteContext {
  params: Promise<{ documentId: string }>
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { documentId } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skill-trees/${documentId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Publish skill tree error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
