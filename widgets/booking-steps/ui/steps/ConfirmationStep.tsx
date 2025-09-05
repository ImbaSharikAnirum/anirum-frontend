'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useUser } from '@/entities/user'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { ContactData } from './ContactStep'
import type { StudentData } from './StudentStep'

interface ConfirmationStepProps {
  contactData: ContactData
  studentData: StudentData
  onBack: () => void
  onConfirm: () => void
}

export function ConfirmationStep({ contactData, studentData, onBack, onConfirm }: ConfirmationStepProps) {
  const { user } = useUser()

  // Функция для получения текущего значения контакта
  const getCurrentContactValue = () => {
    if (contactData.messenger === 'whatsapp') {
      return contactData.whatsappPhone
    } else if (contactData.messenger === 'telegram') {
      return contactData.telegramMode === 'phone' ? contactData.telegramPhone : contactData.telegramUsername
    }
    return ''
  }

  // Функция для вычисления возраста по дате рождения
  const calculateAge = (birthDate: Date | undefined) => {
    if (!birthDate) return ''
    
    const today = new Date()
    const birth = birthDate
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age.toString()
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Подтверждение бронирования</h3>
      <p className="text-sm text-gray-600 mb-6">
        Проверьте данные и подтвердите бронирование.
      </p>

      <div className="space-y-6">
        {/* Контактное лицо */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Контактное лицо</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><span className="font-medium">Имя:</span> {contactData.firstName} {contactData.lastName}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
            <p><span className="font-medium">Мессенджер:</span> {contactData.messenger === 'whatsapp' ? 'WhatsApp' : 'Telegram'}</p>
            <p><span className="font-medium">Контакт:</span> {getCurrentContactValue()}</p>
            {contactData.messenger === 'telegram' && (
              <p><span className="font-medium">Тип:</span> {contactData.telegramMode === 'phone' ? 'Номер телефона' : 'Username'}</p>
            )}
          </div>
        </div>

        {/* Ученик */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Ученик</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {studentData.studentType === 'myself' ? (
              <p>Записываюсь сам/сама</p>
            ) : (
              <>
                <p><span className="font-medium">Имя:</span> {studentData.studentFirstName} {studentData.studentLastName}</p>
                {studentData.studentBirthDate && (
                  <>
                    <p><span className="font-medium">Дата рождения:</span> {format(studentData.studentBirthDate, "dd MMMM yyyy", { locale: ru })}</p>
                    <p><span className="font-medium">Возраст:</span> {calculateAge(studentData.studentBirthDate)} лет</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Назад
        </Button>
        <Button 
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          onClick={onConfirm}
        >
          Подтвердить бронирование
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        После подтверждения с вами свяжется менеджер для уточнения деталей
      </p>
    </Card>
  )
}