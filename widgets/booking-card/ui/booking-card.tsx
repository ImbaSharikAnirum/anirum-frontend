'use client'

import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { Course } from '@/entities/course/model/types'
import { calculateCustomMonthPricing, formatPrice } from '@/shared/lib/course-pricing'
import { formatWeekdays, getDirectionDisplayName, getStrapiImageUrl } from '@/shared/lib/course-utils'
import { formatCourseSchedule } from '@/shared/lib/timezone-utils'
import { useUserTimezone } from '@/shared/hooks/useUserTimezone'

interface BookingCardProps {
  course: Course
  selectedMonth: number
  selectedYear: number
}

export function BookingCard({ course, selectedMonth, selectedYear }: BookingCardProps) {
  const { timezone: userTimezone, loading: timezoneLoading } = useUserTimezone()

  // Рассчитываем данные для выбранного месяца
  const monthlyPricing = calculateCustomMonthPricing({
    year: selectedYear,
    month: selectedMonth - 1, // Преобразуем в 0-based index
    pricePerLesson: course.pricePerLesson,
    currency: course.currency,
    weekdays: course.weekdays,
    courseStartDate: course.startDate,
    courseEndDate: course.endDate
  })

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

  const getAgeRangeText = () => {
    const startAge = course.startAge
    const endAge = course.endAge
    
    if (!startAge && !endAge) {
      return null
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

  const schedule = formatSchedule()
  const displayTimezone = schedule.isConverted ? userTimezone : course.timezone
  const formattedWeekdays = formatWeekdays(course.weekdays)
  const ageRangeText = getAgeRangeText()

  return (
    <Card className="p-4 gap-2">
      {/* Верхняя часть - изображение и детали в ряд */}
      <div className="flex gap-4 mb-2">
        {/* Изображение курса - меньше размером */}
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
          {course.images && course.images.length > 0 ? (
            <Image
              src={typeof course.images[0] === 'string' 
                ? course.images[0] 
                : getStrapiImageUrl(course.images[0].url)
              }
              alt={getDirectionDisplayName(course.direction)}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
              {getDirectionDisplayName(course.direction).charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Детали курса справа */}
        <div className="flex-1 min-w-0">
          {/* Аватар преподавателя и информация */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={course.teacher?.avatar ? (typeof course.teacher.avatar === 'string' ? course.teacher.avatar : course.teacher.avatar?.url) : undefined}
                alt="Преподаватель"
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {getDirectionDisplayName(course.direction)}
              </div>
              <div className="text-sm text-gray-600">
                {course.isOnline ? 'Онлайн' : `${course.city}, ${course.country}`}
              </div>
            </div>
          </div>

          {/* Информация о расписании */}
          <div className="space-y-1 text-sm text-gray-600">
            <div>{formattedWeekdays}</div>
            <div>{schedule.timeRange} ({displayTimezone})</div>
            {ageRangeText && <div>{ageRangeText}</div>}
          </div>
        </div>
      </div>
      <Separator className="" />

      {/* Детализация цены */}
      <div className="space-y-3">
        <h4 className="font-medium">Детализация цены</h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Цена занятия</span>
            <span>{formatPrice(course.pricePerLesson, course.currency)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Занятий в {monthlyPricing.monthName.toLowerCase()}</span>
            <span>{monthlyPricing.lessonsCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span>
              {formatPrice(course.pricePerLesson, course.currency)} × {monthlyPricing.lessonsCount} занятий
            </span>
            <span>{formatPrice(monthlyPricing.totalPrice, course.currency)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-medium">
          <span>Всего</span>
          <span>{formatPrice(monthlyPricing.totalPrice, course.currency)}</span>
        </div>
      </div>
    </Card>
  )
}