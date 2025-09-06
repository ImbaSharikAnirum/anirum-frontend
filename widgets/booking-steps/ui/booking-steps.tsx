'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/entities/course/model/types'
import { useUser } from '@/entities/user'
import { AuthStep, ContactStep, StudentStep, ConfirmationStep, type ContactData, type StudentData } from './steps'

interface BookingStepsProps {
  course: Course
  className?: string
}

type BookingStep = 'auth' | 'contact' | 'student' | 'confirmation'

export function BookingSteps({ course, className }: BookingStepsProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('auth')
  const [contactData, setContactData] = useState<ContactData>({
    firstName: '',
    lastName: '',
    whatsappPhone: '',
    telegramPhone: '',
    telegramUsername: '',
    messenger: 'whatsapp',
    telegramMode: 'phone'
  })
  const [studentData, setStudentData] = useState<StudentData>({
    studentType: null,
    selectedStudent: null,
    studentFirstName: '',
    studentLastName: '',
    studentBirthDate: undefined
  })
  
  const { user, isAuthenticated } = useUser()

  // Проверяем авторизацию и заполненность данных при загрузке
  useEffect(() => {
    if (isAuthenticated && user) {
      // Проверяем заполненность контактных данных
      const hasBasicData = user.name && user.family;
      const hasMessenger = user.whatsapp_phone || user.telegram_phone || user.telegram_username;
      
      if (hasBasicData && hasMessenger) {
        // Если все данные есть, пропускаем контактный этап
        setCurrentStep('student');
        
        // Заполняем contactData из профиля пользователя
        setContactData({
          firstName: user.name || '',
          lastName: user.family || '',
          whatsappPhone: user.whatsapp_phone || '',
          telegramPhone: user.telegram_phone || '',
          telegramUsername: user.telegram_username || '',
          messenger: user.whatsapp_phone ? 'whatsapp' : 'telegram',
          telegramMode: user.telegram_username ? 'username' : 'phone'
        });
      } else {
        // Иначе переходим на контактный этап
        setCurrentStep('contact');
      }
    }
  }, [isAuthenticated, user])

  const handleConfirmBooking = () => {
    // TODO: Отправка данных бронирования
    alert('Бронирование отправлено!')
  }

  return (
    <div className={className}>
      {currentStep === 'auth' && (
        <AuthStep onNext={() => setCurrentStep('contact')} />
      )}
      {currentStep === 'contact' && (
        <ContactStep 
          onNext={() => setCurrentStep('student')}
          onDataChange={setContactData}
          initialData={contactData}
        />
      )}
      {currentStep === 'student' && (
        <StudentStep 
          onNext={() => setCurrentStep('confirmation')}
          onDataChange={setStudentData}
          initialData={studentData}
          courseStartAge={course.startAge}
          courseEndAge={course.endAge}
        />
      )}
      {currentStep === 'confirmation' && (
        <ConfirmationStep 
          contactData={contactData}
          studentData={studentData}
          onBack={() => setCurrentStep('student')}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  )
}