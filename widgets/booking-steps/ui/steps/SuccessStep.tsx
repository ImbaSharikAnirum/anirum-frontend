'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, Calendar, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Invoice } from '@/entities/invoice'

interface SuccessStepProps {
  invoice?: Invoice
  courseDirection: string
  onClose?: () => void
}

export function SuccessStep({ invoice, courseDirection, onClose }: SuccessStepProps) {
  const router = useRouter()

  const handleGoToCourses = () => {
    router.push('/courses')
  }


  return (
    <Card className="p-8 text-center max-w-lg mx-auto">
      {/* Иконка успеха */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      {/* Заголовок */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Бронирование успешно создано!
      </h3>
      
      <p className="text-gray-600 mb-6">
        Ваша заявка на курс <span className="font-medium">"{courseDirection}"</span> принята
      </p>

      {/* Информация о счете */}
      {invoice && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Детали бронирования
          </h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Счет №:</span> {invoice.documentId}</p>
            <p><span className="font-medium">Сумма:</span> {invoice.sum} {invoice.currency}</p>
            <p><span className="font-medium">Период:</span> {new Date(invoice.startDate).toLocaleDateString('ru-RU')} - {new Date(invoice.endDate).toLocaleDateString('ru-RU')}</p>
          </div>
        </div>
      )}

      {/* Следующие шаги */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Что будет дальше?
        </h4>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
              1
            </div>
            <p>Как только наберется минимальное количество студентов, мы отправим счет на оплату</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
              2
            </div>
            <p>После оплаты вы получите все необходимые материалы и доступ к курсу</p>
          </div>
        </div>
      </div>


      {/* Кнопки действий */}
      <div className="space-y-3">
        <Button 
          onClick={handleGoToCourses}
          className="w-full"
        >
          Посмотреть другие курсы
        </Button>
      </div>
    </Card>
  )
}