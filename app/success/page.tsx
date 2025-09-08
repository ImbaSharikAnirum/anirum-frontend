'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, MessageCircle } from 'lucide-react'
import { invoiceAPI } from '@/entities/invoice/api/invoiceApi'
import { courseAPI } from '@/entities/course/api/courseApi'
import type { Course } from '@/entities/course/model/types'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)

  // Извлекаем параметры от Tinkoff
  const success = searchParams?.get('Success')
  const errorCode = searchParams?.get('ErrorCode')
  const message = searchParams?.get('Message')
  const amount = searchParams?.get('Amount')
  const orderId = searchParams?.get('OrderId')
  const paymentId = searchParams?.get('PaymentId')
  const tranDate = searchParams?.get('TranDate')

  const isSuccessful = success === 'true' && errorCode === '0'
  const formattedAmount = amount ? (parseInt(amount) / 100).toLocaleString('ru-RU') : '0'

  useEffect(() => {
    const loadCourseInfo = async () => {
      if (!isSuccessful || !orderId) {
        setIsLoading(false)
        return
      }

      try {
        // orderId это tinkoffOrderId, ищем invoice по нему
        const invoice = await invoiceAPI.getInvoiceByTinkoffOrderId(orderId)
        if (invoice?.course?.documentId) {
          const courseData = await courseAPI.getCourse(invoice.course.documentId, [])
          setCourse(courseData)
        }
      } catch (error) {
        console.error('Ошибка загрузки информации о курсе:', error)
        // Продолжаем работу без информации о курсе
      } finally {
        // Имитируем загрузку для UX
        setTimeout(() => {
          setIsLoading(false)
        }, 1500)
      }
    }

    loadCourseInfo()
  }, [isSuccessful, orderId])

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleBackToCourses = () => {
    router.push('/courses')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Обрабатываем результат платежа...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-lg">
        {isSuccessful ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Оплата успешна!
            </h1>
            <p className="text-gray-600 mb-6">
              Ваш платеж на сумму <strong>{formattedAmount} ₽</strong> успешно обработан.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-800 mb-2">Детали платежа:</h3>
              <div className="space-y-1 text-sm text-green-700">
                {paymentId && (
                  <div>
                    <span className="font-medium">ID платежа:</span> {paymentId}
                  </div>
                )}
                {orderId && (
                  <div>
                    <span className="font-medium">Номер заказа:</span> {orderId}
                  </div>
                )}
                {tranDate && (
                  <div>
                    <span className="font-medium">Дата:</span> {decodeURIComponent(tranDate)}
                  </div>
                )}
              </div>
            </div>
            {course?.urlMessenger ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-5 mb-6 text-left shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-500 rounded-full p-1">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg">
                    Важно! Присоединитесь к группе курса
                  </h3>
                </div>
                <div className="bg-white/70 rounded-md p-4 mb-4">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    В этой группе будут ученики и преподаватель. Вся информация по курсам будет отправляться туда. 
                    <br /><br />
                    <strong>Обязательно вступите в группу</strong> и если вы записали кого-то вместо себя передайте ссылку. 
                    <br /><br />
                    Также информация по переносам или отменам также будет отправляться туда.
                  </p>
                </div>
                <Button 
                  asChild 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                  size="lg"
                >
                  <a 
                    href={course.urlMessenger} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Перейти в группу курса
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-6">
                Информация о курсе и доступе будет отправлена в ближайшее время.
              </p>
            )}
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ошибка оплаты
            </h1>
            <p className="text-gray-600 mb-4">
              К сожалению, платеж не был завершен.
            </p>
            {message && message !== 'None' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">
                  <strong>Причина:</strong> {decodeURIComponent(message)}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mb-6">
              Попробуйте повторить оплату или свяжитесь с нашей поддержкой.
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          {isSuccessful ? (
            <>
              <Button 
                onClick={handleBackToCourses}
                className="w-full"
              >
                Перейти к курсам
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBackToHome}
                className="w-full"
              >
                На главную
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleBackToHome}
                className="w-full"
              >
                На главную
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
