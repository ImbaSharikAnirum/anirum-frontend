'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, Loader2, RefreshCw } from 'lucide-react'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Извлекаем параметры от Tinkoff
  const success = searchParams?.get('Success')
  const errorCode = searchParams?.get('ErrorCode')
  const message = searchParams?.get('Message')
  const details = searchParams?.get('Details')
  const amount = searchParams?.get('Amount')
  const orderId = searchParams?.get('OrderId')

  const formattedAmount = amount ? (parseInt(amount) / 100).toLocaleString('ru-RU') : '0'

  useEffect(() => {
    // Имитируем загрузку для UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleRetryPayment = () => {
    router.push('/courses')
  }

  const getErrorMessage = () => {
    if (message && message !== 'None') {
      return decodeURIComponent(message)
    }
    if (details && details !== '') {
      return decodeURIComponent(details)
    }
    return 'Платеж был отменен или произошла техническая ошибка'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Обрабатываем результат платежа...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-lg">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Платеж не выполнен
        </h1>
        
        <p className="text-gray-600 mb-4">
          Оплата на сумму <strong>{formattedAmount} ₽</strong> не была завершена.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-red-800 mb-2">Причина:</h3>
          <p className="text-sm text-red-700">
            {getErrorMessage()}
          </p>
          {errorCode && errorCode !== '0' && (
            <p className="text-xs text-red-600 mt-2">
              Код ошибки: {errorCode}
            </p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-700 mb-2">Что делать дальше:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Проверьте данные карты и попробуйте снова</li>
            <li>• Убедитесь что на карте достаточно средств</li>
            <li>• Свяжитесь с банком если проблема повторится</li>
            <li>• Обратитесь в нашу поддержку за помощью</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleRetryPayment}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
          <Button 
            variant="outline" 
            onClick={handleBackToHome}
            className="w-full"
          >
            На главную
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            Нужна помощь? Свяжитесь с нами:
          </p>
          <div className="flex justify-center gap-4 text-xs text-blue-600">
            <a href="mailto:support@anirum.com" className="hover:underline">
              Email
            </a>
            <a href="tel:+79142701411" className="hover:underline">
              Телефон
            </a>
          </div>
        </div>
      </Card>
    </div>
  )
}