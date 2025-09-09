import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Передаем все query параметры к Strapi (например, populate=role)
    const strapiParams = new URLSearchParams()
    searchParams.forEach((value, key) => {
      strapiParams.append(key, value)
    })

    const queryString = strapiParams.toString()
    const url = `${process.env.NEXT_PUBLIC_API_URL}/users/me${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Сначала получаем ID текущего пользователя
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: 'Failed to get user ID' }, { status: 401 })
    }

    const currentUser = await userResponse.json()
    const body = await request.json()

    // Обновляем пользователя по ID
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${currentUser.id}`, {
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
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}