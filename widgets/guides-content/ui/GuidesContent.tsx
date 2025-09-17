'use client'

/**
 * Интерактивный контент страницы гайдов
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

interface GuidesContentProps {
  user: User | null
  initialPinterestStatus: PinterestStatus | null
}

export function GuidesContent({ user, initialPinterestStatus }: GuidesContentProps) {
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Гайды</h1>

        {isAuthenticated ? (
          <div className="space-y-6">
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
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-600 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Pinterest подключен!</span>
                  </div>
                  <p className="text-sm text-green-600 mb-3">
                    {pinterestStatus.message}
                  </p>
                  <Button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    variant="outline"
                    size="sm"
                  >
                    {isDisconnecting ? 'Отключаем...' : 'Отключить Pinterest'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold mb-2">Импорт пинов</h2>
                  <p className="text-gray-600 mb-4">
                    Теперь вы можете импортировать пины из Pinterest и сохранить их как гайды
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    🎨 Импортировать пины
                  </Button>
                </div>
              </div>
            ) : (
              // Pinterest не подключен
              <div className="space-y-4">
                <p className="text-lg text-gray-600">
                  Подключите Pinterest, чтобы импортировать пины и сохранить их как гайды
                </p>
                <PinterestLogin className="mx-auto">
                  🎨 Подключить Pinterest
                </PinterestLogin>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Войдите в аккаунт, чтобы начать работу с гайдами
            </p>
            <a
              href="/auth/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Войти в аккаунт
            </a>
          </div>
        )}
      </div>
    </div>
  )
}