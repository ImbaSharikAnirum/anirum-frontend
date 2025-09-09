'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { invoiceAPI, Invoice } from '@/entities/invoice'
import { courseAPI, Course } from '@/entities/course'
import { PaymentForm } from '@/widgets/payment-form'
import { BookingCard } from '@/widgets/booking-card'
import { BookingDetails } from '@/widgets/booking-details'
import { BookingHeader } from '@/widgets/booking-header'

export default function PaymentDetailsPage() {
  const params = useParams()
  const courseId = params?.courseId as string
  const paymentId = params?.paymentId as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [monthlyInvoices, setMonthlyInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      // Валидация входных параметров
      if (!courseId || !paymentId) {
        console.error('Недостаточно параметров для загрузки страницы оплаты', { courseId, paymentId })
        setError(new Error('Недостаточно параметров'))
        return
      }

      // Проверка формата documentId (должен быть строкой)
      if (typeof courseId !== 'string' || typeof paymentId !== 'string') {
        console.error('Неверный формат параметров courseId или paymentId', { 
          courseIdType: typeof courseId, 
          paymentIdType: typeof paymentId 
        })
        setError(new Error('Неверный формат параметров'))
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Загружаем курс как в бронировании
        const courseData = await courseAPI.getCourse(courseId, ["images", "teacher.avatar"])
        
        if (!courseData) {
          console.error('Курс не найден')
          setError(new Error('Курс не найден'))
          return
        }
        setCourse(courseData)

        // Загружаем конкретный invoice отдельно
        let invoiceData
        try {
          // Попробуем загрузить invoice через публичный API
          invoiceData = await invoiceAPI.getPublicInvoice(paymentId)
        } catch (invoiceError) {
          console.error('Ошибка загрузки invoice:', paymentId, invoiceError)
          setError(new Error('Invoice не найден'))
          return
        }

        if (!invoiceData) {
          console.error('Invoice не найден:', paymentId)
          setError(new Error('Invoice не найден'))
          return
        }

        // Дополнительная проверка: invoice должен содержать связь с курсом
        if (!invoiceData.course || typeof invoiceData.course !== 'object') {
          console.error('Invoice не содержит информацию о связанном курсе')
          setError(new Error('Invoice не содержит информацию о связанном курсе'))
          return
        }
        
        // Если у нас есть documentId курса в invoice, проверим его
        if (invoiceData.course.documentId && invoiceData.course.documentId !== courseId) {
          console.error(`Invoice относится к курсу ${invoiceData.course.documentId}, а запрашивается ${courseId}`)
          setError(new Error('Invoice относится к другому курсу'))
          return
        }

        setInvoice(invoiceData)

        // Извлекаем месяц и год из invoice для виджетов
        const invoiceStartDate = new Date(invoiceData.startDate)
        const selectedMonth = invoiceStartDate.getMonth() + 1 // JavaScript месяцы начинаются с 0
        const selectedYear = invoiceStartDate.getFullYear()

        // Загружаем инвойсы за тот же период для BookingCard
        const monthlyInvoicesData = await invoiceAPI.getCourseInvoices(courseId, {
          month: selectedMonth,
          year: selectedYear
        })
        setMonthlyInvoices(monthlyInvoicesData)

      } catch (err) {
        console.error('Непредвиденная ошибка при загрузке данных для оплаты:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId && paymentId) {
      loadData()
    }
  }, [courseId, paymentId])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course || !invoice) {
    console.error('Ошибка или отсутствие данных:', error)
    notFound()
  }

  // Извлекаем месяц и год из invoice для виджетов
  const invoiceStartDate = new Date(invoice.startDate)
  const selectedMonth = invoiceStartDate.getMonth() + 1 
  const selectedYear = invoiceStartDate.getFullYear()
    
  return (
    <div className="container mx-auto px-4 py-8">
      {/* На мобильных - заголовок сверху */}
      <div className="lg:hidden mb-6">
        <BookingHeader />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* На мобильных - сначала карточка */}
        <div className="lg:hidden">
          <BookingCard 
            course={course}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            monthlyInvoices={monthlyInvoices}
            paymentInvoice={invoice}
          />
        </div>

        {/* Левая колонка (на десктопе) - заголовок, детали и форма оплаты */}
        <div className="space-y-8">
          {/* Заголовок только на десктопе */}
          <div className="hidden lg:block">
            <BookingHeader />
          </div>
          
          <BookingDetails 
            course={course} 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
          
          <PaymentForm 
            invoice={invoice}
            course={course}
          />
        </div>

        {/* Правая колонка (на десктопе) - карточка курса */}
        <div className="hidden lg:block">
          <BookingCard 
            course={course}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            monthlyInvoices={monthlyInvoices}
            paymentInvoice={invoice}
          />
        </div>
      </div>
    </div>
  )
}