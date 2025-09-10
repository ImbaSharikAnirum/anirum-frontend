'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Course } from '@/entities/course/model/types'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { useUserTimezone } from '@/shared/hooks/useUserTimezone'
import { formatCourseSchedule, getTimezoneAbbreviation } from '@/shared/lib/timezone-utils'
import { getDirectionDisplayName, getCurrencySymbol, formatWeekdays, getStrapiImageUrl } from '@/shared/lib/course-utils'
import { calculateCustomMonthPricing, calculateProRatedPricing, formatPrice } from '@/shared/lib/course-pricing'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CourseEnrollmentProgress } from './course-enrollment-progress'
import { useRouter } from 'next/navigation'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Кастомные стили для слайдера
const swiperCustomStyles = `
  .swiper-custom .swiper-button-next,
  .swiper-custom .swiper-button-prev {
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    opacity: 0;
  }

  .swiper-custom .swiper-button-next:hover,
  .swiper-custom .swiper-button-prev:hover {
    background: rgba(255, 255, 255, 0.8);
  }

  .image-container:hover .swiper-custom .swiper-button-next,
  .image-container:hover .swiper-custom .swiper-button-prev {
    opacity: 1;
  }

  .swiper-custom .swiper-button-next,
  .swiper-custom .swiper-button-prev {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .swiper-custom .swiper-button-next:after,
  .swiper-custom .swiper-button-prev:after {
    font-size: 14px;
    font-weight: 600;
    color: #000000;
    margin: 0;
    line-height: 1;
  }
`

interface CourseCardProps {
  course: Course
  className?: string
  onClick?: (course: Course) => void
  index?: number
}

export function CourseCard({ course, className, onClick, index = 0 }: CourseCardProps) {
  const { timezone: userTimezone, loading: timezoneLoading } = useUserTimezone()
  const router = useRouter()

  // Рассчитываем стоимость для текущего месяца с частичной оплатой
  const currentDate = new Date()
  const proRatedPricing = calculateProRatedPricing({
    fromDate: currentDate,
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
    pricePerLesson: course.pricePerLesson,
    currency: course.currency,
    weekdays: course.weekdays,
    courseStartDate: course.startDate,
    courseEndDate: course.endDate
  })
  
  const formatLessonPrice = (price: number) => {
    return formatPrice(price, course.currency)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Проверяем, не кликнули ли на элементы управления слайдером или tooltip
    const target = e.target as HTMLElement
    const isSwiper = target.closest('.swiper-button-next, .swiper-button-prev, .swiper-pagination')
    const isTooltip = target.closest('[data-slot="tooltip-trigger"], [data-slot="tooltip-content"]')
    
    if (!isSwiper && !isTooltip) {
      // Вызываем переданный onClick если есть
      onClick?.(course)
      // Переходим на страницу курса (используем documentId в Strapi 5)
      router.push(`/courses/${course.documentId || course.id}`)
    }
  }

  const formatSchedule = () => {
    if (timezoneLoading) {
      return {
        timeRange: `${course.startTime} - ${course.endTime}`,
        timezone: course.timezone,
        isConverted: false
      }
    }

    return formatCourseSchedule(
      course.startTime,
      course.endTime,
      course.timezone,
      userTimezone
    )
  }

  const getLocationText = () => {
    if (course.isOnline) {
      return 'Онлайн'
    }
    return `${course.address}`
  }

  const getAgeRangeText = () => {
    const startAge = course.startAge
    const endAge = course.endAge
    
    if (!startAge && !endAge) {
      return null // Нет ограничений по возрасту
    }
    
    if (startAge && endAge) {
      return `${startAge}-${endAge} лет`
    }
    
    if (startAge && !endAge) {
      return `от ${startAge} лет`
    }
    
    if (!startAge && endAge) {
      return `до ${endAge} лет`
    }
    
    return null
  }

  const formattedWeekdays = formatWeekdays(course.weekdays)
  const ageRangeText = getAgeRangeText()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: swiperCustomStyles }} />
      <div 
        className={cn(
          "group cursor-pointer",
          className
        )}
        onClick={handleCardClick}
      >
      {/* Слайдер изображений курса */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-4 image-container border border-gray-200">
        {course.images && course.images.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              enabled: true,
            }}
            pagination={{ 
              clickable: true,
              bulletClass: 'swiper-pagination-bullet !bg-white !opacity-50',
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-white !opacity-100'
            }}
            loop
            style={{
              '--swiper-navigation-color': '#000000',
              '--swiper-navigation-size': '16px'
            } as React.CSSProperties}
            className="w-full h-full swiper-custom"
          >
            {course.images.map((image, index) => (
              <SwiperSlide key={index}>
                <Image
                  src={typeof image === 'string' ? image : getStrapiImageUrl(image.url)}
                  alt={typeof image === 'string' ? `${getDirectionDisplayName(course.direction)} - изображение ${index + 1}` : image.alternativeText || `${getDirectionDisplayName(course.direction)} - изображение ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          // Fallback если нет изображений
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            {getDirectionDisplayName(course.direction).charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Информация о курсе */}
      <div className="space-y-1">
        {/* Аватар преподавателя и направление */}
        <div className="flex items-start space-x-2 mb-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={course.teacher?.avatar ? (typeof course.teacher.avatar === 'string' ? course.teacher.avatar : course.teacher.avatar?.url || '/default-avatar.png') : '/default-avatar.png'}
              alt="Преподаватель"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {getDirectionDisplayName(course.direction)}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-4 h-7">
              {course.isOnline ? 'Онлайн' : getLocationText()}
            </p>
          </div>
        </div>

        {/* Расписание и локация */}
        <div className="text-xs text-gray-600 space-y-1 leading-4">
          <div className="flex flex-col">
            {(() => {
              const schedule = formatSchedule()
              const displayTimezone = schedule.isConverted ? userTimezone : course.timezone
              
              return (
                <>
                  <div className="flex items-center justify-between">
                    <span>{schedule.timeRange} ({displayTimezone})</span>
                  </div>
                </>
              )
            })()}
          </div>
          <div>{formattedWeekdays}</div>
          {ageRangeText && (
            <div>{ageRangeText}</div>
          )}
        </div>

        {/* Процесс записи - реальные данные из инвойсов */}
        {(() => {
          // Подсчитываем общее количество студентов (всех инвойсов независимо от оплаты)
          const totalStudents = course.invoices?.length || 0
          
          return (
            <CourseEnrollmentProgress 
              currentStudents={totalStudents}
              minStudents={course.minStudents}
              maxStudents={course.maxStudents}
              className="py-1"
            />
          )
        })()}

        {/* Цена */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-md">
              <span className="">{formatLessonPrice(course.pricePerLesson)}</span> за занятие
            </span>
          </div>
          {proRatedPricing.remainingLessons > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-gray-500 underline text-sm cursor-help">
                  Всего {formatPrice(proRatedPricing.proRatedPrice, course.currency)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-900 text-white border-0">
                <p>{proRatedPricing.monthName}: {proRatedPricing.remainingLessons} занятий</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      </div>
    </>
  )
}