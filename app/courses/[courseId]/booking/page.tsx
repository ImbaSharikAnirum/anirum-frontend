'use client'
import { courseAPI } from '@/entities/course/api/courseApi'
import { notFound } from 'next/navigation'
import { BookingDetails } from '@/widgets/booking-details'
import { BookingCard } from '@/widgets/booking-card'
import { BookingSteps } from '@/widgets/booking-steps'
import { BookingHeader } from '@/widgets/booking-header'

interface BookingPageProps {
  params: Promise<{
    courseId: string
  }>
  searchParams?: {
    month?: string
    year?: string
  }
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { courseId } = await  params
  const resolvedSearch = await searchParams
  const month = resolvedSearch?.month ? parseInt(resolvedSearch.month) : new Date().getMonth() + 1
  const year = resolvedSearch?.year ? parseInt(resolvedSearch.year) : new Date().getFullYear()

  try {
    const course = await courseAPI.getCourse(courseId)
    
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
            
            {/* <BookingSteps course={course} /> */}
          </div>

          {/* Правая колонка (на десктопе) - карточка курса */}
          <div className="hidden lg:block">
            <BookingCard 
              course={course}
              selectedMonth={month}
              selectedYear={year}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Ошибка загрузки курса:', error)
    notFound()
  }
}