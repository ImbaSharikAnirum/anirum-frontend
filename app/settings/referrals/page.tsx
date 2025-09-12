'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  Copy, 
  Share2, 
  TrendingUp, 
  Users, 
  Gift,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Wallet
} from 'lucide-react'
import { referralAPI, type ReferralCode, type ReferralStats } from '@/entities/referral'
import { useUser } from '@/entities/user'

export default function ReferralsPage() {
  const { user } = useUser()
  const [myCode, setMyCode] = useState<ReferralCode | null>(null)
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Загружаем промокод и статистику параллельно
      const [codeResponse, statsResponse] = await Promise.all([
        referralAPI.getMyCode(),
        referralAPI.getStats()
      ])

      setMyCode(codeResponse.referralCode)
      setStats(statsResponse)
    } catch (err: any) {
      console.error('Error loading referral data:', err)
      setError(err.message || 'Ошибка загрузки данных')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (!myCode) return

    try {
      await navigator.clipboard.writeText(myCode.code)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = () => {
    if (!myCode) return

    const shareText = `Получи скидку 10% на курсы с промокодом ${myCode.code}!`
    const shareUrl = `${window.location.origin}?ref=${myCode.code}`

    if (navigator.share) {
      navigator.share({
        title: 'Приглашение на курсы',
        text: shareText,
        url: shareUrl,
      })
    } else {
      // Fallback - копируем в буфер обмена
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      alert('Ссылка скопирована в буфер обмена!')
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + '₽'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачено'
      case 'pending': return 'Ожидает оплаты'
      case 'cancelled': return 'Отменено'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadData} className="mt-4">
          Попробовать снова
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Реферальная программа</h1>
        <p className="text-muted-foreground mt-2">
          Приглашайте друзей и получайте бонусы за каждую их запись на курсы
        </p>
      </div>

      {/* Мой промокод */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Ваш промокод</h2>
        </div>
        
        {myCode && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="referral-code">Промокод</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="referral-code"
                  value={myCode.code}
                  readOnly
                  className="font-mono text-lg font-bold"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyCode}
                  className="min-w-[100px]"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Копировать
                    </>
                  )}
                </Button>
                <Button onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Поделиться
                </Button>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Как это работает:</strong> Ваши друзья получают скидку 10% при использовании промокода, 
                а вы получаете 10% от стоимости их курса в виде бонусов после их оплаты.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Использований: {myCode.currentUses}/{myCode.maxUses}</span>
              <span>Создан: {formatDate(myCode.createdAt)}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Доступный баланс */}
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Доступно к тратам</p>
                <p className="text-2xl font-bold">{formatPrice(user?.bonusBalance || 0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Всего использований</p>
                <p className="text-2xl font-bold">{stats.totalUses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Заработано рефералами</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalEarned)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Активных кодов</p>
                <p className="text-2xl font-bold">{stats.totalCodes}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Последняя активность */}
      {stats && stats.recentActivity.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Последняя активность</h2>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(activity.status)}
                  <div>
                    <p className="font-medium">{activity.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.course} • {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    +{formatPrice(activity.amount)}
                  </p>
                  <Badge 
                    variant={activity.status === 'paid' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {getStatusText(activity.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {stats.recentActivity.length >= 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Смотреть всю историю
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Баланс бонусов */}
      {user && (user.bonusBalance > 0 || user.totalEarnedBonuses > 0 || user.totalSpentBonuses > 0) && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wallet className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Баланс бонусов</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-700 mb-1">Доступно</p>
              <p className="text-2xl font-bold text-emerald-800">{formatPrice(user.bonusBalance || 0)}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 mb-1">Всего заработано</p>
              <p className="text-2xl font-bold text-green-800">{formatPrice(user.totalEarnedBonuses || 0)}</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 mb-1">Потрачено</p>
              <p className="text-2xl font-bold text-blue-800">{formatPrice(user.totalSpentBonuses || 0)}</p>
            </div>
          </div>
          
          {user.bonusBalance > 0 && (
            <Alert className="mt-4 border-emerald-200 bg-emerald-50">
              <Wallet className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                Вы можете использовать до <strong>{formatPrice(user.bonusBalance)}</strong> при записи на курсы
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* Пустое состояние */}
      {stats && stats.totalUses === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Пока никто не использовал ваш промокод</h3>
          <p className="text-muted-foreground mb-4">
            Поделитесь своим промокодом с друзьями, чтобы начать зарабатывать бонусы
          </p>
          <Button onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Поделиться промокодом
          </Button>
        </Card>
      )}
    </div>
  )
}