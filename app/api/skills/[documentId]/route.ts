import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

interface RouteContext {
  params: Promise<{ documentId: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { documentId } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    const { searchParams } = new URL(request.url)

    // Передаем все query параметры к Strapi
    const strapiParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      strapiParams.append(key, value)
    })

    const queryString = strapiParams.toString()
    const url = `${process.env.NEXT_PUBLIC_API_URL}/skills/${documentId}${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch skill' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Get skill error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { documentId } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/${documentId}`, {
      method: 'PUT',
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
    console.error('Update skill error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { documentId } = await context.params
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete skill error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
