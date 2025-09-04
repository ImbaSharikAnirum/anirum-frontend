/**
 * Утилиты для расчета стоимости курсов
 * @layer shared
 */

import { Course } from '@/entities/course/model/types'

export interface MonthlyPricing {
  month: number
  year: number
  monthName: string
  lessonsCount: number
  totalPrice: number
  pricePerLesson: number
  currency: string
  isAvailable: boolean
}

export interface CourseScheduleInfo {
  startDate: Date
  endDate: Date
  weekdays: string[]
  timezone: string
}

/**
 * Получает информацию о расписании курса
 */
export function getCourseScheduleInfo(course: Course): CourseScheduleInfo {
  return {
    startDate: new Date(course.startDate),
    endDate: new Date(course.endDate), 
    weekdays: course.weekdays,
    timezone: course.timezone
  }
}

/**
 * Получает следующий доступный месяц для курса
 */
export function getNextAvailableMonth(course: Course, currentDate: Date = new Date()): Date {
  const scheduleInfo = getCourseScheduleInfo(course)
  const nextMonth = new Date(currentDate)
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1)
  
  // Если следующий месяц после окончания курса, возвращаем первый месяц курса
  if (nextMonth > scheduleInfo.endDate) {
    return new Date(scheduleInfo.startDate.getFullYear(), scheduleInfo.startDate.getMonth(), 1)
  }
  
  // Если следующий месяц до начала курса, возвращаем месяц начала курса
  if (nextMonth < scheduleInfo.startDate) {
    return new Date(scheduleInfo.startDate.getFullYear(), scheduleInfo.startDate.getMonth(), 1)
  }
  
  return nextMonth
}

/**
 * Подсчитывает количество занятий в конкретном месяце
 */
export function countLessonsInMonth(
  year: number, 
  month: number, // 0-based (0 = январь)
  weekdays: string[],
  courseStart: Date,
  courseEnd: Date
): number {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0) // последний день месяца
  
  // Ограничиваем диапазон датами курса
  const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
  const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))
  
  if (effectiveStart > effectiveEnd) {
    return 0
  }
  
  // Маппинг английских дней недели в номера (0 = воскресенье)
  const weekdayMap: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  }
  
  const targetWeekdays = weekdays.map(day => weekdayMap[day.toLowerCase()]).filter(day => day !== undefined)
  
  let count = 0
  const currentDate = new Date(effectiveStart)
  
  while (currentDate <= effectiveEnd) {
    if (targetWeekdays.includes(currentDate.getDay())) {
      count++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return count
}

/**
 * Получает название месяца на русском языке
 */
export function getMonthName(month: number): string {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  return months[month]
}

/**
 * Рассчитывает стоимость курса для конкретного месяца
 */
export function calculateMonthlyPricing(
  course: Course, 
  year: number, 
  month: number // 0-based
): MonthlyPricing {
  const scheduleInfo = getCourseScheduleInfo(course)
  const lessonsCount = countLessonsInMonth(
    year, 
    month, 
    scheduleInfo.weekdays,
    scheduleInfo.startDate,
    scheduleInfo.endDate
  )
  
  const totalPrice = lessonsCount * course.pricePerLesson
  const monthStart = new Date(year, month, 1)
  const isAvailable = monthStart >= scheduleInfo.startDate && monthStart <= scheduleInfo.endDate
  
  return {
    month,
    year,
    monthName: getMonthName(month),
    lessonsCount,
    totalPrice,
    pricePerLesson: course.pricePerLesson,
    currency: course.currency,
    isAvailable: isAvailable && lessonsCount > 0
  }
}

/**
 * Рассчитывает стоимость для следующего месяца
 */
export function calculateNextMonthPricing(course: Course, currentDate: Date = new Date()): MonthlyPricing {
  const nextMonth = getNextAvailableMonth(course, currentDate)
  return calculateMonthlyPricing(course, nextMonth.getFullYear(), nextMonth.getMonth())
}

/**
 * Получает все доступные месяцы для курса с расчетом стоимости
 */
export function getAllMonthlyPricing(course: Course): MonthlyPricing[] {
  const scheduleInfo = getCourseScheduleInfo(course)
  const result: MonthlyPricing[] = []
  
  const currentDate = new Date(scheduleInfo.startDate.getFullYear(), scheduleInfo.startDate.getMonth(), 1)
  const endDate = new Date(scheduleInfo.endDate.getFullYear(), scheduleInfo.endDate.getMonth(), 1)
  
  while (currentDate <= endDate) {
    const pricing = calculateMonthlyPricing(course, currentDate.getFullYear(), currentDate.getMonth())
    if (pricing.isAvailable) {
      result.push(pricing)
    }
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  
  return result
}

/**
 * Форматирует цену с валютой
 */
export function formatPrice(amount: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    'RUB': '₽',
    'USD': '$',
    'EUR': '€'
  }
  
  const symbol = currencySymbols[currency] || currency
  return `${new Intl.NumberFormat('ru-RU').format(amount)} ${symbol}`
}

/**
 * Упрощенная функция для расчета стоимости произвольного месяца
 * Принимает только необходимые параметры без полного объекта Course
 */
export function calculateCustomMonthPricing(params: {
  year: number
  month: number // 0-based (0 = январь)
  pricePerLesson: number
  currency: string
  weekdays: string[]
  courseStartDate: string // ISO string
  courseEndDate: string // ISO string
}): MonthlyPricing {
  const startDate = new Date(params.courseStartDate)
  const endDate = new Date(params.courseEndDate)
  
  const lessonsCount = countLessonsInMonth(
    params.year,
    params.month,
    params.weekdays,
    startDate,
    endDate
  )
  
  const totalPrice = lessonsCount * params.pricePerLesson
  const monthStart = new Date(params.year, params.month, 1)
  const isAvailable = monthStart >= startDate && monthStart <= endDate
  
  return {
    month: params.month,
    year: params.year,
    monthName: getMonthName(params.month),
    lessonsCount,
    totalPrice,
    pricePerLesson: params.pricePerLesson,
    currency: params.currency,
    isAvailable: isAvailable && lessonsCount > 0
  }
}

/**
 * Получает список всех доступных месяцев с ценами для произвольного курса
 */
export function getCustomCourseMonths(params: {
  pricePerLesson: number
  currency: string
  weekdays: string[]
  courseStartDate: string
  courseEndDate: string
}): MonthlyPricing[] {
  const startDate = new Date(params.courseStartDate)
  const endDate = new Date(params.courseEndDate)
  const result: MonthlyPricing[] = []
  
  const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const lastDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
  
  while (currentDate <= lastDate) {
    const pricing = calculateCustomMonthPricing({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      pricePerLesson: params.pricePerLesson,
      currency: params.currency,
      weekdays: params.weekdays,
      courseStartDate: params.courseStartDate,
      courseEndDate: params.courseEndDate
    })
    
    if (pricing.isAvailable) {
      result.push(pricing)
    }
    
    currentDate.setMonth(currentDate.getMonth() + 1)
  }
  
  return result
}

/**
 * Быстрый расчет для конкретного месяца по названию
 */
export function calculateMonthByName(params: {
  monthName: string // 'январь', 'февраль', etc.
  year?: number // по умолчанию текущий год
  pricePerLesson: number
  currency: string
  weekdays: string[]
  courseStartDate: string
  courseEndDate: string
}): MonthlyPricing | null {
  const months = [
    'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
    'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
  ]
  
  const monthIndex = months.findIndex(m => m.toLowerCase() === params.monthName.toLowerCase())
  if (monthIndex === -1) return null
  
  const year = params.year || new Date().getFullYear()
  
  return calculateCustomMonthPricing({
    year,
    month: monthIndex,
    pricePerLesson: params.pricePerLesson,
    currency: params.currency,
    weekdays: params.weekdays,
    courseStartDate: params.courseStartDate,
    courseEndDate: params.courseEndDate
  })
}

/**
 * Получает максимальную стоимость курса за месяц (для фильтров)
 */
export function getMaxMonthlyPrice(params: {
  pricePerLesson: number
  currency: string
  weekdays: string[]
  courseStartDate: string
  courseEndDate: string
}): number {
  const allMonths = getCustomCourseMonths(params)
  return Math.max(...allMonths.map(month => month.totalPrice), 0)
}

/**
 * Получает среднюю стоимость курса за месяц
 */
export function getAverageMonthlyPrice(params: {
  pricePerLesson: number
  currency: string
  weekdays: string[]
  courseStartDate: string
  courseEndDate: string
}): number {
  const allMonths = getCustomCourseMonths(params)
  if (allMonths.length === 0) return 0
  
  const totalPrice = allMonths.reduce((sum, month) => sum + month.totalPrice, 0)
  return Math.round(totalPrice / allMonths.length)
}