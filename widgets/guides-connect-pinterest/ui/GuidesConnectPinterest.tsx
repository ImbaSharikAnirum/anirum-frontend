'use client'

/**
 * Виджет подключения/отключения Pinterest
 * @layer widgets
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PinterestLogin } from '@/shared/ui'
import type { User } from '@/entities/user/model/types'

interface PinterestStatus {
  isConnected: boolean
  message: string
}

interface GuidesConnectPinterestProps {
  user: User | null
  initialPinterestStatus: PinterestStatus | null
}

export function GuidesConnectPinterest({ user, initialPinterestStatus }: GuidesConnectPinterestProps) {
  const [pinterestStatus, setPinterestStatus] = useState<PinterestStatus | null>(initialPinterestStatus)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const isAuthenticated = !!user

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

  return (
    <div className="space-y-6">
      {isAuthenticated ? (
        <>
          {pinterestStatus === null ? (
            // Ошибка при проверке статуса (только при реальной ошибке API)
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                <span>Не удалось проверить статус Pinterest</span>
              </div>
              <div className="mt-4">
                <PinterestLogin className="mx-auto">
                  🎨 Подключить Pinterest
                </PinterestLogin>
              </div>
            </div>
          ) : pinterestStatus.isConnected ? (
            // Pinterest подключен
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Pinterest подключен!</span>
              </div>
              <p className="text-sm text-green-600 mb-3">
                {pinterestStatus.message}
              </p>
              {/* TODO: Отключение Pinterest будет доступно в настройках */}
              {/* <Button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                variant="outline"
                size="sm"
              >
                {isDisconnecting ? 'Отключаем...' : 'Отключить Pinterest'}
              </Button> */}
            </div>
          ) : (
            // Pinterest не подключен
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Pinterest</h3>
              <p className="text-gray-600 mb-4">
                Подключите Pinterest, чтобы импортировать пины и сохранить их как гайды
              </p>
              <PinterestLogin className="mx-auto">
                🎨 Подключить Pinterest
              </PinterestLogin>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 mb-4">
            Войдите в аккаунт, чтобы подключить Pinterest
          </p>
          <a
            href="/auth/login"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Войти в аккаунт
          </a>
        </div>
      )}
    </div>
  )
}