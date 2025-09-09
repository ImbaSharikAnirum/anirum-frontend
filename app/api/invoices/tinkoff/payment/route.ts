import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    const body = await request.json()

    // Для создания платежа Tinkoff может не требоваться авторизация в некоторых случаях
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/invoices/tinkoff/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Create Tinkoff payment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}