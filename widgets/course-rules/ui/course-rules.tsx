'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  CheckCircle, 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  Clock,
  Smartphone,
  Palette,
  Smile,
  Info,
  FileText,
  Users
} from 'lucide-react'

export function CourseRules() {
  const [openCompanyRules, setOpenCompanyRules] = useState(false)
  const [openLearningRules, setOpenLearningRules] = useState(false)
  const [openContract, setOpenContract] = useState(false)

  return (
    <div className="space-y-2 mt-4">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Правила компании */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Правила компании</h4>
          <div className="space-y-2 text-sm mb-4">
            <p>Допуск и регистрация</p>
            <p>Платежи и финансовые обязательства</p>
            <p>Правила посещения</p>
            <p>Дополнительные условия</p>
          </div>
            <Dialog open={openCompanyRules} onOpenChange={setOpenCompanyRules}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold text-primary">
                  Подробнее
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Правила компании</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Допуск и регистрация
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Все учащиеся должны зарегистрироваться</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Допуск к занятиям только для зарегистрированных учащихся</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Сообщите о наличии специальных условий, если это необходимо</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Платежи и финансовые обязательства
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Соблюдайте сроки платежей</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Соглашение с политикой возврата средств</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Правила посещения
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Информируйте администрацию о пропусках занятий заранее</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Дополнительные условия
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Проявляйте уважение к преподавателям и другим учащимся</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>

        {/* Правила обучения */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Правила обучения</h4>
          <div className="space-y-2 text-sm mb-4">
            <p>Посещаемость</p>
            <p>Поддержание порядка</p>
            <p>Дружелюбная атмосфера</p>
            <p>Дополнительная информация</p>
          </div>
            <Dialog open={openLearningRules} onOpenChange={setOpenLearningRules}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold text-primary">
                  Подробнее
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Правила обучения</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Посещаемость
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Учащиеся должны приходить вовремя</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>В группах ограниченное количество мест</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Материалы для пропущенных занятий будут предоставлены</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Поддержание порядка
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Уважайте преподавателей и одногруппников</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Ответственность за оборудование студии</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Smartphone className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Запрещено использование телефонов во время занятий</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Palette className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Необходимые материалы для занятий предоставляются</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Дружелюбная атмосфера
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Smile className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Мы ожидаем дружелюбной и безопасной обстановки</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Smile className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Соблюдайте уважительное поведение</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Дополнительная информация
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Согласие с условиями и правилами</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>

        {/* Договор и условия */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Договор и условия</h4>
          <div className="space-y-2 text-sm mb-4">
            <p>Важные условия</p>
            <p>Обязательства сторон</p>
            <p>Условия отмены занятий</p>
            <p>Порядок возврата средств</p>
          </div>
            <Dialog open={openContract} onOpenChange={setOpenContract}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold">
                  Подробнее
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Договор и условия</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Важные условия
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Учащиеся должны следовать условиям договора</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Все платежи должны быть произведены вовремя</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Обязательства сторон
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Все учащиеся обязаны уважать друг друга</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Все обязательства должны выполняться</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Условия отмены занятий
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Отмена возможна за 48 часов до начала занятия</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Возврат средств не осуществляется после начала занятия</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-semibold text-gray-900 mb-3">
                      Порядок возврата средств
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-500 mt-0.5" />
                        <span>Возврат средств осуществляется по условиям договора</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>
    </div>
  )
}