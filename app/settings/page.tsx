"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimezoneFilter } from '@/shared/ui/timezone-filter'
import { useUserTimezone } from '@/shared/hooks/useUserTimezone'
import { Clock, RotateCcw, Gift, Users, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SettingsPage() {
  const { timezone: detectedTimezone, loading } = useUserTimezone()
  const [selectedTimezone, setSelectedTimezone] = useState<string>('')
  const [hasChanges, setHasChanges] = useState(false)

  // Загружаем сохраненный часовой пояс при монтировании
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user-timezone')
      if (saved) {
        setSelectedTimezone(saved)
      } else if (!loading && detectedTimezone) {
        setSelectedTimezone(detectedTimezone)
      }
    }
  }, [detectedTimezone, loading])

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone)
    setHasChanges(true)
  }

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-timezone', selectedTimezone)
      setHasChanges(false)
      
      // Принудительно обновляем кеш в хуке
      if ((window as any).location) {
        window.location.reload()
      }
      
      toast.success('Часовой пояс сохранен!')
    }
  }

  const handleReset = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user-timezone')
      setSelectedTimezone(detectedTimezone)
      setHasChanges(true)
      toast.info('Сброшено к автоопределению')
    }
  }

  const getCurrentTime = (timezone: string) => {
    if (!timezone) return ''
    try {
      return new Intl.DateTimeFormat('ru-RU', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(new Date())
    } catch {
      return ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Настройки</h1>
        <p className="text-gray-600">Настройте ваши предпочтения для работы с платформой</p>
      </div>

      <div className="space-y-6">
        {/* Настройка часового пояса */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Часовой пояс</CardTitle>
            </div>
            <CardDescription>
              Выберите ваш часовой пояс для корректного отображения времени курсов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Выбранный часовой пояс
                </label>
                <TimezoneFilter
                  value={selectedTimezone}
                  onTimezoneChange={handleTimezoneChange}
                  placeholder="Выберите часовой пояс"
                  className="w-full"
                />
              </div>
              
              {selectedTimezone && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Текущее время
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-mono text-lg">
                      {getCurrentTime(selectedTimezone)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={handleSave}
                disabled={!hasChanges || !selectedTimezone}
              >
                Сохранить изменения
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReset}
                disabled={!selectedTimezone}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Сбросить к автоопределению
              </Button>
            </div>

            {detectedTimezone && (
              <div className="text-sm text-gray-500 border-t pt-4">
                Автоопределенный часовой пояс: <span className="font-medium">{detectedTimezone}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Реферальная программа */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              <CardTitle>Реферальная программа</CardTitle>
            </div>
            <CardDescription>
              Приглашайте друзей и получайте бонусы за каждую их запись на курсы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Зарабатывайте вместе</h3>
                  <p className="text-sm text-gray-600">
                    10% скидка другу + 10% бонусов вам
                  </p>
                </div>
              </div>
              <Link href="/settings/referrals">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Управление
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">10%</div>
                <div className="text-xs text-green-700">скидка другу</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">10%</div>
                <div className="text-xs text-blue-700">бонусы вам</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-xs text-purple-700">использований</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}