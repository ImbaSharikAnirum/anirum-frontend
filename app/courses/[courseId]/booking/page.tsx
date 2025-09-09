'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, notFound } from 'next/navigation'
import { courseAPI } from '@/entities/course'
import { invoiceAPI, Invoice } from '@/entities/invoice'
import { Course } from '@/entities/course/model/types'
import { BookingDetails } from '@/widgets/booking-details'
import { BookingCard } from '@/widgets/booking-card'
import { BookingSteps } from '@/widgets/booking-steps'
import { BookingHeader } from '@/widgets/booking-header'

export default function BookingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params?.courseId as string
  const month = searchParams?.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1
  const year = searchParams?.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [monthlyInvoices, setMonthlyInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Загружаем курс без инвойсов (они загружаются отдельно)
        const courseData = await courseAPI.getCourse(courseId, ["images", "teacher.avatar"])
        setCourse(courseData)
        
        // Отдельно загружаем инвойсы за выбранный период
        const invoicesData = await invoiceAPI.getCourseInvoices(courseId, {
          month,
          year
        })
        setMonthlyInvoices(invoicesData)
        
      } catch (err) {
        console.error('Ошибка загрузки данных:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId) {
      loadData()
    }
  }, [courseId, month, year])

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

  if (error || !course) {
    notFound()
  }
  
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
            selectedMonth={month}
            selectedYear={year}
            monthlyInvoices={monthlyInvoices}
          />
        </div>

        {/* Левая колонка (на десктопе) - заголовок, детали и этапы бронирования */}
        <div className="space-y-8">
          {/* Заголовок только на десктопе */}
          <div className="hidden lg:block">
            <BookingHeader />
          </div>
          
          <BookingDetails 
            course={course} 
            selectedMonth={month}
            selectedYear={year}
          />
          
          <BookingSteps 
            course={course} 
            selectedMonth={month}
            selectedYear={year}
            monthlyInvoices={monthlyInvoices}
          />
        </div>

        {/* Правая колонка (на десктопе) - карточка курса */}
        <div className="hidden lg:block">
          <BookingCard 
            course={course}
            selectedMonth={month}
            selectedYear={year}
            monthlyInvoices={monthlyInvoices}
          />
        </div>
      </div>
    </div>
  )
}