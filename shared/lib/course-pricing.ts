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
 * Получает первую и последнюю дату занятий в конкретном месяце
 */
export function getMonthLessonDates(
  year: number, 
  month: number, // 0-based (0 = январь)
  weekdays: string[],
  courseStart: Date,
  courseEnd: Date
): { firstLesson: Date | null, lastLesson: Date | null } {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  
  // Ограничиваем диапазон датами курса
  const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
  const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))
  
  if (effectiveStart > effectiveEnd) {
    return { firstLesson: null, lastLesson: null }
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
  
  let firstLesson = null
  let lastLesson = null
  
  // Начинаем с первого дня месяца и ищем занятия только в указанные дни недели
  const searchStart = new Date(year, month, 1)
  const searchEnd = new Date(Math.min(monthEnd.getTime(), effectiveEnd.getTime()))
  const searchDate = new Date(searchStart)
  
  while (searchDate <= searchEnd) {
    // Проверяем, что дата не раньше начала курса и в нужный день недели
    if (searchDate >= effectiveStart && targetWeekdays.includes(searchDate.getDay())) {
      if (!firstLesson) {
        firstLesson = new Date(searchDate)
      }
      lastLesson = new Date(searchDate)
    }
    searchDate.setDate(searchDate.getDate() + 1)
  }
  
  return { firstLesson, lastLesson }
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
 * Учитывает только месяцы с оставшимися занятиями
 */
export function getAllMonthlyPricing(course: Course, fromDate: Date = new Date()): MonthlyPricing[] {
  const scheduleInfo = getCourseScheduleInfo(course)
  const result: MonthlyPricing[] = []

  const currentDate = new Date(scheduleInfo.startDate.getFullYear(), scheduleInfo.startDate.getMonth(), 1)
  const endDate = new Date(scheduleInfo.endDate.getFullYear(), scheduleInfo.endDate.getMonth(), 1)

  while (currentDate <= endDate) {
    // Используем countRemainingLessonsFromDate для правильного подсчета
    const lessonCounts = countRemainingLessonsFromDate(
      fromDate,
      currentDate.getFullYear(),
      currentDate.getMonth(),
      scheduleInfo.weekdays,
      scheduleInfo.startDate,
      scheduleInfo.endDate
    )

    // Показываем только месяцы с оставшимися занятиями
    if (lessonCounts.remaining > 0) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const isAvailable = monthStart >= scheduleInfo.startDate && monthStart <= scheduleInfo.endDate

      result.push({
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        monthName: getMonthName(currentDate.getMonth()),
        lessonsCount: lessonCounts.remaining, // Оставшиеся занятия
        totalPrice: lessonCounts.remaining * course.pricePerLesson,
        pricePerLesson: course.pricePerLesson,
        currency: course.currency,
        isAvailable: isAvailable
      })
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

/**
 * Интерфейс для результата частичной оплаты
 */
export interface ProRatedPricing {
  month: number
  year: number
  monthName: string
  totalLessonsInMonth: number
  completedLessons: number
  remainingLessons: number
  fullPrice: number
  proRatedPrice: number
  pricePerLesson: number
  currency: string
  isPartial: boolean
  fromDate: Date
}

/**
 * Подсчитывает оставшиеся занятия в месяце с определенной даты
 */
export function countRemainingLessonsFromDate(
  fromDate: Date,
  year: number, 
  month: number, // 0-based (0 = январь)
  weekdays: string[],
  courseStart: Date,
  courseEnd: Date
): { total: number, completed: number, remaining: number } {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  
  // Ограничиваем диапазон датами курса
  const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
  const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))
  
  if (effectiveStart > effectiveEnd) {
    return { total: 0, completed: 0, remaining: 0 }
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
  
  let totalCount = 0
  let completedCount = 0
  let remainingCount = 0
  
  const currentDate = new Date(effectiveStart)
  
  while (currentDate <= effectiveEnd) {
    if (targetWeekdays.includes(currentDate.getDay())) {
      totalCount++
      
      if (currentDate < fromDate) {
        completedCount++
      } else {
        remainingCount++
      }
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return { 
    total: totalCount, 
    completed: completedCount, 
    remaining: remainingCount 
  }
}

/**
 * Рассчитывает частичную стоимость курса (pro-rated) с определенной даты
 */
export function calculateProRatedPricing(params: {
  fromDate: Date // С какой даты начинается оплата
  year: number
  month: number // 0-based (0 = январь)
  pricePerLesson: number
  currency: string
  weekdays: string[]
  courseStartDate: string // ISO string
  courseEndDate: string // ISO string
}): ProRatedPricing {
  const startDate = new Date(params.courseStartDate)
  const endDate = new Date(params.courseEndDate)
  
  // Подсчитываем все занятия и оставшиеся
  const lessonCounts = countRemainingLessonsFromDate(
    params.fromDate,
    params.year,
    params.month,
    params.weekdays,
    startDate,
    endDate
  )
  
  const fullPrice = lessonCounts.total * params.pricePerLesson
  const proRatedPrice = lessonCounts.remaining * params.pricePerLesson
  
  return {
    month: params.month,
    year: params.year,
    monthName: getMonthName(params.month),
    totalLessonsInMonth: lessonCounts.total,
    completedLessons: lessonCounts.completed,
    remainingLessons: lessonCounts.remaining,
    fullPrice,
    proRatedPrice,
    pricePerLesson: params.pricePerLesson,
    currency: params.currency,
    isPartial: lessonCounts.completed > 0,
    fromDate: params.fromDate
  }
}

/**
 * Получает список дат всех занятий в произвольном периоде
 */
export function getAllLessonDatesInPeriod(
  startDate: Date,
  endDate: Date,
  weekdays: string[],
  courseStart: Date,
  courseEnd: Date
): Date[] {
  // Ограничиваем диапазон датами курса
  const effectiveStart = new Date(Math.max(startDate.getTime(), courseStart.getTime()))
  const effectiveEnd = new Date(Math.min(endDate.getTime(), courseEnd.getTime()))
  
  if (effectiveStart > effectiveEnd) {
    return []
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
  
  if (targetWeekdays.length === 0) {
    return []
  }

  const lessonDates: Date[] = []
  const current = new Date(effectiveStart)
  
  // Проходим по всем дням в диапазоне
  while (current <= effectiveEnd) {
    const dayOfWeek = current.getDay()
    
    if (targetWeekdays.includes(dayOfWeek)) {
      lessonDates.push(new Date(current))
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  return lessonDates
}

/**
 * Получает список дат всех занятий в месяце
 */
export function getAllLessonDatesInMonth(
  year: number, 
  month: number, // 0-based (0 = январь)
  weekdays: string[],
  courseStart: Date,
  courseEnd: Date
): Date[] {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  
  // Ограничиваем диапазон датами курса
  const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
  const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))
  
  if (effectiveStart > effectiveEnd) {
    return []
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
  const lessonDates: Date[] = []
  
  const currentDate = new Date(effectiveStart)
  
  while (currentDate <= effectiveEnd) {
    if (targetWeekdays.includes(currentDate.getDay())) {
      lessonDates.push(new Date(currentDate))
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return lessonDates
}