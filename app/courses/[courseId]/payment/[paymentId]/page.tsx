import { invoiceAPI } from '@/entities/invoice'
import { courseAPI } from '@/entities/course'
import { notFound } from 'next/navigation'
import { PaymentForm } from '@/widgets/payment-form'
import { BookingCard } from '@/widgets/booking-card'
import { BookingDetails } from '@/widgets/booking-details'
import { BookingHeader } from '@/widgets/booking-header'
import { Metadata } from 'next'

interface PaymentDetailsPageProps {
  params: Promise<{
    courseId: string
    paymentId: string // Это будет documentId invoice
  }>
}

// Генерируем метаданные для страницы
export async function generateMetadata({ params }: PaymentDetailsPageProps): Promise<Metadata> {
  try {
    const { courseId, paymentId } = await params
    const invoice = await invoiceAPI.getPublicInvoice(paymentId)
    const course = await courseAPI.getCourse(courseId, ["teacher"])
    
    return {
      title: `Оплата за курс - ${invoice.statusPayment ? 'Оплачено' : 'К оплате'}`,
      description: `Счет на сумму ${invoice.sum} ${invoice.currency} за курс "${course.description}" от преподавателя ${course.teacher?.name} ${course.teacher?.family}`,
      robots: {
        index: false, // Не индексировать страницы оплаты
        follow: false
      }
    }
  } catch (error) {
    return {
      title: 'Оплата курса',
      description: 'Страница оплаты за курс'
    }
  }
}

export default async function PaymentDetailsPage({ params }: PaymentDetailsPageProps) {
  const { courseId, paymentId } = await params
  
  // Валидация входных параметров
  if (!courseId || !paymentId) {
    console.error('Недостаточно параметров для загрузки страницы оплаты', { courseId, paymentId })
    notFound()
  }

  // Проверка формата documentId (должен быть строкой)
  if (typeof courseId !== 'string' || typeof paymentId !== 'string') {
    console.error('Неверный формат параметров courseId или paymentId', { 
      courseIdType: typeof courseId, 
      paymentIdType: typeof paymentId 
    })
    notFound()
  }

  try {
    // Загружаем курс как в бронировании
    const course = await courseAPI.getCourse(courseId, ["images", "teacher.avatar"])
    
    if (!course) {
      console.error('Курс не найден')
      notFound()
    }

    // Загружаем конкретный invoice отдельно (используем существующий метод getInvoice, но без токена)
    let invoice
    try {
      // Попробуем загрузить invoice через публичный API
      invoice = await invoiceAPI.getPublicInvoice(paymentId)
    } catch (error) {
      console.error('Ошибка загрузки invoice:', paymentId, error)
      notFound()
    }

    if (!invoice) {
      console.error('Invoice не найден:', paymentId)
      notFound()
    }

    // Дополнительная проверка: invoice должен содержать связь с курсом
    if (!invoice.course || typeof invoice.course !== 'object') {
      console.error('Invoice не содержит информацию о связанном курсе')
      notFound()
    }
    
    // Если у нас есть documentId курса в invoice, проверим его
    if (invoice.course.documentId && invoice.course.documentId !== courseId) {
      console.error(`Invoice относится к курсу ${invoice.course.documentId}, а запрашивается ${courseId}`)
      notFound()
    }

    // Извлекаем месяц и год из invoice для виджетов
    const invoiceStartDate = new Date(invoice.startDate)
    const selectedMonth = invoiceStartDate.getMonth() + 1 // JavaScript месяцы начинаются с 0
    const selectedYear = invoiceStartDate.getFullYear()

    // Загружаем инвойсы за тот же период для BookingCard
    const monthlyInvoices = await invoiceAPI.getCourseInvoices(courseId, {
      month: selectedMonth,
      year: selectedYear
    })
    
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
  } catch (error) {
    console.error('Непредвиденная ошибка при загрузке данных для оплаты:', error)
    notFound()
  }
}