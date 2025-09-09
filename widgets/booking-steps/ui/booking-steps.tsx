'use client'

import { useState, useEffect } from 'react'
import { Course } from '@/entities/course/model/types'
import { useUser } from '@/entities/user'
import { invoiceAPI, type CreateInvoiceData, type TinkoffPaymentData } from '@/entities/invoice'
import { studentAPI } from '@/entities/student'
import { calculateCustomMonthPricing, calculateProRatedPricing, getMonthLessonDates, getAllLessonDatesInMonth } from '@/shared/lib/course-pricing'
import { getDirectionDisplayName } from '@/shared/lib/course-utils'
import { canDirectPayment } from '@/shared/lib/booking-utils'
import { AuthStep, ContactStep, StudentStep, ConfirmationStep, SuccessStep, type ContactData, type StudentData } from './steps'
import type { Invoice } from '@/entities/invoice'

interface BookingStepsProps {
  course: Course
  selectedMonth: number // 1-12
  selectedYear: number
  monthlyInvoices: Invoice[]
  className?: string
}

type BookingStep = 'auth' | 'contact' | 'student' | 'confirmation' | 'success'

export function BookingSteps({ course, selectedMonth, selectedYear, monthlyInvoices, className }: BookingStepsProps) {
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

  const handleConfirmBooking = async () => {
    if (!user) {
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
        }, user.id)
        
        studentName = newStudent.name
        studentFamily = newStudent.family
        studentId = newStudent.documentId
      }

      // 2. Рассчитываем частичную стоимость с сегодняшней даты
      const proRatedPricing = calculateProRatedPricing({
        fromDate: new Date(), // С сегодняшнего дня
        year: selectedYear,
        month: selectedMonth - 1,
        pricePerLesson: course.pricePerLesson,
        currency: course.currency,
        weekdays: course.weekdays,
        courseStartDate: course.startDate,
        courseEndDate: course.endDate
      })

      if (proRatedPricing.remainingLessons === 0) {
        throw new Error('В выбранном месяце нет оставшихся занятий для данного курса')
      }

      // 3. Определяем startDate (ближайшее занятие) и endDate для счета
      const courseStart = new Date(course.startDate)
      const courseEnd = new Date(course.endDate)
      
      // Получаем все даты занятий в месяце
      const allLessonDates = getAllLessonDatesInMonth(
        selectedYear,
        selectedMonth - 1,
        course.weekdays,
        courseStart,
        courseEnd
      )

      // Находим ближайшее будущее занятие и последнее занятие
      const currentDate = new Date()
      const nextLesson = allLessonDates.find(date => date >= currentDate) || allLessonDates[0]
      const lastLesson = allLessonDates[allLessonDates.length - 1]

      if (!nextLesson || !lastLesson) {
        throw new Error('В выбранном месяце нет занятий для данного курса')
      }

      // Функция для корректного форматирования даты без смещения UTC
      const formatDateForInvoice = (date: Date): string => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }

      // 4. Создаем счет с частичной оплатой
      const invoiceData: CreateInvoiceData = {
        name: studentName,
        family: studentFamily,
        sum: proRatedPricing.proRatedPrice, // Только за оставшиеся занятия
        currency: 'RUB', // По умолчанию RUB как в требованиях
        startDate: formatDateForInvoice(nextLesson), // Ближайшее занятие
        endDate: formatDateForInvoice(lastLesson),
        statusPayment: false,
        course: course.documentId,
        owner: user.documentId || user.id.toString()
      }

      const invoice = await invoiceAPI.createInvoice(invoiceData)
      
      // Перенаправляем на нашу страницу оплаты вместо прямого перехода на Tinkoff
      // Это позволит пользователям получать ссылку для повторной оплаты
      const paymentUrl = `/courses/${course.documentId}/payment/${invoice.documentId}`
      window.location.href = paymentUrl
      
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
          monthlyInvoices={monthlyInvoices}
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