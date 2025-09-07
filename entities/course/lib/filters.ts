/**
 * Чистые функции для фильтрации курсов
 * @layer entities
 */

import { Course } from '../model/types'

export interface CourseFilters {
  direction?: string
  format?: 'online' | 'offline'
  city?: string  // Город для оффлайн курсов
  age?: number   // Возраст пользователя
  teacherId?: string | null  // documentId преподавателя для Strapi 5
  complexity?: 'beginner' | 'experienced' | 'professional'
  courseType?: 'club' | 'course' | 'intensive' | 'individual'
  weekdays?: string[]  // Дни недели ['monday', 'tuesday', ...]
  priceRange?: [number, number]  // Диапазон цен [min, max]
  timeSlot?: 'morning' | 'afternoon' | 'evening'  // Временные слоты
}

import { convertTimeSlotToMoscow } from '@/shared/lib/timezone'

/**
 * Преобразует фильтры в параметры для API
 */
export function buildApiFilters(filters: CourseFilters, userTimezone?: string): Record<string, any> {
  const apiFilters: Record<string, any> = {}

  if (filters.direction) {
    apiFilters.direction = filters.direction
  }

  if (filters.format === 'online') {
    apiFilters.isOnline = true
  } else if (filters.format === 'offline') {
    apiFilters.isOnline = false
    
    // Для оффлайн добавляем фильтр по городу, если он указан
    if (filters.city) {
      apiFilters.city = filters.city
    }
  }

  if (filters.teacherId) {
    // Фильтр по documentId преподавателя для Strapi 5
    apiFilters.teacher = {
      documentId: {
        $eq: filters.teacherId
      }
    }
  }

  if (filters.complexity) {
    apiFilters.complexity = filters.complexity
  }

  if (filters.courseType) {
    apiFilters.courseType = filters.courseType
  }

  if (filters.weekdays && filters.weekdays.length > 0) {
    // Для Strapi 5: фильтр по массиву дней недели
    // Используем $containsi для поиска пересечений с массивом
    apiFilters.weekdays = {
      $containsi: filters.weekdays
    }
  }

  if (filters.priceRange && filters.priceRange.length === 2) {
    const [minPrice, maxPrice] = filters.priceRange
    // Фильтр по диапазону цен
    apiFilters.pricePerLesson = {
      $gte: minPrice,
      $lte: maxPrice
    }
  }

  if (filters.timeSlot && userTimezone) {
    // Конвертируем временной слот пользователя в московское время
    const moscowTimeRange = convertTimeSlotToMoscow(filters.timeSlot, userTimezone)
    
    // Фильтр по normalizedStartTime (курсы с нормализованным московским временем)
    apiFilters.normalizedStartTime = {
      $gte: moscowTimeRange.startTime,
      $lt: moscowTimeRange.endTime
    }
  }

  // Автоматический фильтр: показывать только активные курсы (не завершившиеся)
  const today = new Date()
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  // Правильный синтаксис для Strapi 5
  apiFilters.$or = [
    // Курсы, которые еще не закончились
    { 
      endDate: { 
        $gte: todayString 
      } 
    },
    // Или курсы без даты окончания (постоянные)
    { 
      endDate: { 
        $null: true 
      } 
    }
  ]

  // Возрастной фильтр - сложная логика, делаем только клиентскую фильтрацию
  // API фильтрация по возрасту не добавляется из-за сложности запроса

  return apiFilters
}

/**
 * Клиентская фильтрация курсов (fallback если сервер не поддерживает фильтр)
 */
export function filterCourses(courses: Course[], filters: CourseFilters): Course[] {
  return courses.filter(course => {
    // Направление
    if (filters.direction && course.direction !== filters.direction) {
      return false
    }

    // Формат (онлайн/оффлайн)
    if (filters.format === 'online' && !course.isOnline) {
      return false
    }
    if (filters.format === 'offline' && course.isOnline) {
      return false
    }

    // Город для оффлайн курсов
    if (filters.city && !course.isOnline && course.city !== filters.city) {
      return false
    }

    // Преподаватель
    if (filters.teacherId && course.teacher?.documentId !== filters.teacherId) {
      return false
    }

    // Сложность
    if (filters.complexity && course.complexity !== filters.complexity) {
      return false
    }

    // Тип курса
    if (filters.courseType && course.courseType !== filters.courseType) {
      return false
    }

    // Фильтрация по дням недели
    if (filters.weekdays && filters.weekdays.length > 0) {
      const courseWeekdays = course.weekdays || []
      // Проверяем есть ли пересечение между выбранными днями и днями курса
      const hasIntersection = filters.weekdays.some(day => courseWeekdays.includes(day))
      if (!hasIntersection) {
        return false
      }
    }

    // Фильтрация по цене
    if (filters.priceRange && filters.priceRange.length === 2) {
      const [minPrice, maxPrice] = filters.priceRange
      if (course.pricePerLesson < minPrice || course.pricePerLesson > maxPrice) {
        return false
      }
    }

    // Фильтрация по возрасту
    if (filters.age !== undefined) {
      const userAge = filters.age
      const courseMinAge = course.startAge
      const courseMaxAge = course.endAge

      // Если у курса не указан возраст, он подходит всем
      if (!courseMinAge && !courseMaxAge) {
        return true
      }

      // Логика фильтрации:
      // 1. Если указаны оба возраста курса - пользователь должен попадать в диапазон
      if (courseMinAge && courseMaxAge) {
        if (userAge < courseMinAge || userAge > courseMaxAge) {
          return false
        }
      }
      // 2. Если указан только минимальный возраст
      else if (courseMinAge && !courseMaxAge) {
        // Для пользователей 18+ минимальный возраст курса должен быть <= 18
        if (userAge >= 18 && courseMinAge > 18) {
          return false
        }
        // Для младше 18 - обычная проверка
        else if (userAge < 18 && userAge < courseMinAge) {
          return false
        }
      }
      // 3. Если указан только максимальный возраст
      else if (!courseMinAge && courseMaxAge) {
        if (userAge > courseMaxAge) {
          return false
        }
      }
    }

    return true
  })
}

/**
 * Получает уникальные значения для автозаполнения фильтров
 */
export function getFilterOptions(courses: Course[]) {
  // Используем reduce вместо Set для избежания проблем с TypeScript
  const directions = courses
    .map(c => c.direction)
    .filter(Boolean)
    .reduce<string[]>((acc, direction) => {
      if (!acc.includes(direction)) {
        acc.push(direction)
      }
      return acc
    }, [])

  const teachers = courses
    .map(c => c.teacher)
    .filter(Boolean)
    .reduce<{id: number, username: string}[]>((acc, teacher) => {
      if (teacher && !acc.find(t => t.id === teacher.id)) {
        acc.push({id: teacher.id, username: teacher.username})
      }
      return acc
    }, [])

  const complexities = courses
    .map(c => c.complexity)
    .filter(Boolean)
    .reduce<string[]>((acc, complexity) => {
      if (complexity && !acc.includes(complexity)) {
        acc.push(complexity)
      }
      return acc
    }, [])

  const courseTypes = courses
    .map(c => c.courseType)
    .filter(Boolean)
    .reduce<string[]>((acc, type) => {
      if (type && !acc.includes(type)) {
        acc.push(type)
      }
      return acc
    }, [])

  return {
    directions,
    teachers,
    complexities,
    courseTypes
  }
}

/**
 * Проверяет, есть ли активные фильтры
 */
export function hasActiveFilters(filters: CourseFilters): boolean {
  return Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  )
}

/**
 * Очищает все фильтры
 */
export function clearFilters(): CourseFilters {
  return {}
}