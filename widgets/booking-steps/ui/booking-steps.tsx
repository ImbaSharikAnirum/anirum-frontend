'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/entities/course/model/types'
import { useUser } from '@/entities/user'
import { invoiceAPI, type CreateInvoiceData } from '@/entities/invoice'
import { studentAPI } from '@/entities/student'
import { calculateCustomMonthPricing } from '@/shared/lib/course-pricing'
import { AuthStep, ContactStep, StudentStep, ConfirmationStep, type ContactData, type StudentData } from './steps'

interface BookingStepsProps {
  course: Course
  selectedMonth: number // 1-12
  selectedYear: number
  className?: string
}

type BookingStep = 'auth' | 'contact' | 'student' | 'confirmation'

export function BookingSteps({ course, selectedMonth, selectedYear, className }: BookingStepsProps) {
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
  
  const { user, token, isAuthenticated } = useUser()

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

  const handleConfirmBooking = async () => {
    if (!user || !token) {
      alert('Необходимо авторизоваться')
      return
    }

    try {
      // 1. Определяем данные студента
      let studentName = ''
      let studentFamily = ''
      let studentId = null

      if (studentData.studentType === 'myself') {
        studentName = contactData.firstName
        studentFamily = contactData.lastName
      } else if (studentData.studentType === 'existing' && studentData.selectedStudent) {
        studentName = studentData.selectedStudent.name
        studentFamily = studentData.selectedStudent.family
        studentId = studentData.selectedStudent.documentId
      } else if (studentData.studentType === 'new') {
        // Создаем нового студента
        const newStudent = await studentAPI.createStudent({
          name: studentData.studentFirstName,
          family: studentData.studentLastName,
          age: studentData.studentBirthDate?.toISOString().split('T')[0] || ''
        }, token, user.id)
        
        studentName = newStudent.name
        studentFamily = newStudent.family
        studentId = newStudent.documentId
      }

      // 2. Рассчитываем стоимость для выбранного месяца
      const monthPricing = calculateCustomMonthPricing({
        year: selectedYear,
        month: selectedMonth - 1, // Convert to 0-based
        pricePerLesson: course.pricePerLesson,
        currency: course.currency,
        weekdays: course.weekdays,
        courseStartDate: course.startDate,
        courseEndDate: course.endDate
      })

      // 3. Определяем startDate и endDate для счета на основе выбранного месяца
      const monthStart = new Date(selectedYear, selectedMonth - 1, 1)
      const monthEnd = new Date(selectedYear, selectedMonth, 0)
      
      // Ограничиваем диапазон датами курса
      const courseStart = new Date(course.startDate)
      const courseEnd = new Date(course.endDate)
      const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
      const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))

      // 4. Создаем счет
      const invoiceData: CreateInvoiceData = {
        name: studentName,
        family: studentFamily,
        sum: monthPricing.totalPrice,
        currency: 'RUB', // По умолчанию RUB как в требованиях
        startDate: effectiveStart.toISOString().split('T')[0],
        endDate: effectiveEnd.toISOString().split('T')[0],
        statusPayment: false,
        course: course.id,
        owner: user.id
      }

      const invoice = await invoiceAPI.createInvoice(invoiceData, token)
      
      alert(`Бронирование создано! Счет #${invoice.documentId} на сумму ${monthPricing.totalPrice} ${course.currency}`)
      
    } catch (error) {
      console.error('Ошибка создания бронирования:', error)
      alert('Ошибка при создании бронирования. Попробуйте еще раз.')
    }
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