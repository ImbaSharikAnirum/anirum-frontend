import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fileId = params.id

    // Удаляем файл в Strapi
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/upload/files/${fileId}`, {
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
    console.error('Delete file error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}