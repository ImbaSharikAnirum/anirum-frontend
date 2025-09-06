'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/entities/course/model/types'
import { useUser } from '@/entities/user'
import { invoiceAPI, type CreateInvoiceData } from '@/entities/invoice'
import { studentAPI } from '@/entities/student'
import { calculateCustomMonthPricing, getMonthLessonDates } from '@/shared/lib/course-pricing'
import { getDirectionDisplayName } from '@/shared/lib/course-utils'
import { getInvoicesForMonth } from '@/shared/lib/booking-utils'
import { AuthStep, ContactStep, StudentStep, ConfirmationStep, SuccessStep, type ContactData, type StudentData } from './steps'
import type { Invoice } from '@/entities/invoice'

interface BookingStepsProps {
  course: Course
  selectedMonth: number // 1-12
  selectedYear: number
  className?: string
}

type BookingStep = 'auth' | 'contact' | 'student' | 'confirmation' | 'success'

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
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null)
  
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

      // 3. Определяем startDate и endDate для счета на основе реальных дат занятий
      const courseStart = new Date(course.startDate)
      const courseEnd = new Date(course.endDate)
      const { firstLesson, lastLesson } = getMonthLessonDates(
        selectedYear, 
        selectedMonth - 1, // Конвертируем в 0-based как ожидает функция
        course.weekdays, 
        courseStart, 
        courseEnd
      )

      if (!firstLesson || !lastLesson) {
        throw new Error('В выбранном месяце нет занятий для данного курса')
      }

      // Функция для корректного форматирования даты без смещения UTC
      const formatDateForInvoice = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // 4. Создаем счет
      const invoiceData: CreateInvoiceData = {
        name: studentName,
        family: studentFamily,
        sum: monthPricing.totalPrice,
        currency: 'RUB', // По умолчанию RUB как в требованиях
        startDate: formatDateForInvoice(firstLesson),
        endDate: formatDateForInvoice(lastLesson),
        statusPayment: false,
        course: course.documentId,
        owner: user.documentId || user.id.toString()
      }

      const invoice = await invoiceAPI.createInvoice(invoiceData, token)
      
      // Сохраняем созданный инвойс и переходим к успешному этапу
      setCreatedInvoice(invoice)
      setCurrentStep('success')
      
    } catch (error) {
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
          contactData={contactData}
        />
      )}
      {currentStep === 'confirmation' && (
        <ConfirmationStep 
          course={course}
          contactData={contactData}
          studentData={studentData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onBack={() => setCurrentStep('student')}
          onConfirm={handleConfirmBooking}
        />
      )}
      {currentStep === 'success' && (
        <SuccessStep 
          invoice={createdInvoice || undefined}
          courseDirection={getDirectionDisplayName(course.direction)}
          onClose={() => setCurrentStep('auth')} // Возвращаемся к началу для нового бронирования
        />
      )}
    </div>
  )
}