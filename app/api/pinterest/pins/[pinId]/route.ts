/**
 * Pinterest Pin by ID API endpoint
 * GET /api/pinterest/pins/[pinId]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/shared/lib/auth'

interface PinParams {
  pinId: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<PinParams> }
) {
  try {
    const { pinId } = await params
    const user = await getServerUser()

    if (!user?.pinterestAccessToken) {
      return NextResponse.json(
        { error: 'Pinterest не подключен' },
        { status: 401 }
      )
    }

    // Запрос к Pinterest API для получения конкретного пина
    const response = await fetch(`https://api.pinterest.com/v5/pins/${pinId}`, {
      headers: {
        'Authorization': `Bearer ${user.pinterestAccessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Пин не найден' },
          { status: 404 }
        )
      }

      const errorText = await response.text()
      console.error('Pinterest API error:', response.status, errorText)

      return NextResponse.json(
        { error: 'Ошибка Pinterest API' },
        { status: response.status }
      )
    }

    const pinData = await response.json()

    // Добавляем link как в основном API
    const pinWithLink = {
      ...pinData,
      link: `https://www.pinterest.com/pin/${pinData.id}/`,
      isSaved: false, // TODO: Проверить сохранен ли пин в гайдах
    }

    return NextResponse.json({
      pin: pinWithLink,
    })

  } catch (error) {
    console.error('Pinterest pin API error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}