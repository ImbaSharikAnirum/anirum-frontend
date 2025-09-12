import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Валидация входных данных
    if (!body.code || !body.coursePrice) {
      return NextResponse.json({ 
        error: 'Не указан промокод или стоимость курса' 
      }, { status: 400 })
    }

    if (typeof body.coursePrice !== 'number' || body.coursePrice <= 0) {
      return NextResponse.json({ 
        error: 'Некорректная стоимость курса' 
      }, { status: 400 })
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/referral-codes/validate`, {
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
    console.error('Validate referral code error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}