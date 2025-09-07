import { courseAPI } from '@/entities/course/api/courseApi'
import { invoiceAPI, Invoice } from '@/entities/invoice'
import { notFound } from 'next/navigation'
import { BookingDetails } from '@/widgets/booking-details'
import { BookingCard } from '@/widgets/booking-card'
import { BookingSteps } from '@/widgets/booking-steps'
import { BookingHeader } from '@/widgets/booking-header'

interface BookingPageProps {
  params: Promise<{
    courseId: string
  }>
  searchParams: Promise<{
    month?: string
    year?: string
  }>
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { courseId } = await params
  const searchParamsData = await searchParams
  const month = searchParamsData?.month ? parseInt(searchParamsData.month) : new Date().getMonth() + 1
  const year = searchParamsData?.year ? parseInt(searchParamsData.year) : new Date().getFullYear()
  
  try {
    // Загружаем курс без инвойсов (они загружаются отдельно)
    const course = await courseAPI.getCourse(courseId, ["images", "teacher.avatar"])
    
    // Отдельно загружаем инвойсы за выбранный период
    const monthlyInvoices = await invoiceAPI.getCourseInvoices(courseId, {
      month,
      year
    })
    
    console.log('Загружен курс для бронирования:', course)
    console.log('Загружены инвойсы за период:', monthlyInvoices)
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
  } catch (error) {
    console.error('Ошибка загрузки курса:', error)
    notFound()
  }
}