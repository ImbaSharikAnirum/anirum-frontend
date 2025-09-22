'use client'

/**
 * Виджет настроек Pinterest для страницы настроек
 * @layer widgets
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Link2, Unlink } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/entities/user/model/types'

interface PinterestStatus {
  isConnected: boolean
  username?: string
  message?: string
}

interface PinterestSettingsProps {
  user: User | null
  initialPinterestStatus: PinterestStatus | null | undefined
}

export function PinterestSettings({ user, initialPinterestStatus }: PinterestSettingsProps) {
  const [pinterestStatus, setPinterestStatus] = useState<PinterestStatus | null>(initialPinterestStatus || null)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const isAuthenticated = !!user

  // Синхронизируем состояние когда приходят новые данные из родителя
  useEffect(() => {
    if (initialPinterestStatus !== undefined) {
      setPinterestStatus(initialPinterestStatus)
    }
  }, [initialPinterestStatus])

  // Debug logging
  console.log('PinterestSettings render:', {
    isAuthenticated,
    pinterestStatus,
    initialPinterestStatus,
    willShow: isAuthenticated && pinterestStatus?.isConnected
  })

  const fetchPinterestStatus = async () => {
    try {
      const response = await fetch('/api/pinterest/status')
      if (response.ok) {
        const data = await response.json()
        setPinterestStatus(data)
      } else {
        setPinterestStatus(null)
      }
    } catch (error) {
      console.error('Ошибка получения статуса Pinterest:', error)
      setPinterestStatus(null)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)

      const response = await fetch('/api/pinterest/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Pinterest успешно отключен')
        // Обновляем статус
        await fetchPinterestStatus()
      } else {
        throw new Error('Ошибка при отключении Pinterest')
      }
    } catch (error) {
      console.error('Ошибка отключения Pinterest:', error)
      toast.error('Произошла ошибка при отключении Pinterest')
    } finally {
      setIsDisconnecting(false)
    }
  }

  // Показываем виджет только если пользователь авторизован
  if (!isAuthenticated) {
    return null
  }

  // Если Pinterest не подключен, не показываем виджет
  if (!pinterestStatus?.isConnected) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          <CardTitle>Pinterest интеграция</CardTitle>
        </div>
        <CardDescription>
          Управление подключением к вашему аккаунту Pinterest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статус подключения */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Pinterest подключен</span>
          </div>
          {pinterestStatus.message && (
            <p className="text-sm text-green-600 mb-3">
              {pinterestStatus.message}
            </p>
          )}
          {pinterestStatus.username && (
            <p className="text-sm text-green-700">
              Подключен аккаунт: <span className="font-medium">@{pinterestStatus.username}</span>
            </p>
          )}
        </div>

        {/* Управление подключением */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Отключить Pinterest</h3>
            <p className="text-sm text-gray-600">
              Отключение приведет к потере доступа к вашим пинам на платформе
            </p>
          </div>
          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Unlink className="h-4 w-4" />
            {isDisconnecting ? 'Отключаем...' : 'Отключить'}
          </Button>
        </div>

        {/* Информация */}
        <div className="text-sm text-gray-500 border-t pt-4">
          <p>
            <strong>Что произойдет при отключении:</strong>
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Доступ к пинам будет прекращен</li>
            <li>Импорт новых пинов станет недоступен</li>
            <li>Ранее сохраненные гайды из пинов останутся</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}