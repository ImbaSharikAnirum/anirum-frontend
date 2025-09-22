/**
 * Утилиты для синхронизации фильтров с URL
 * @layer shared
 */

import { CourseFilters } from '@/entities/course/lib/filters'
import { ReadonlyURLSearchParams } from 'next/navigation'

/**
 * Преобразует фильтры в URL search params
 */
export function filtersToSearchParams(filters: CourseFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.direction) {
    params.set('direction', filters.direction)
  }

  if (filters.format) {
    params.set('format', filters.format)
  }

  if (filters.city) {
    params.set('city', filters.city)
  }

  if (filters.age !== undefined) {
    params.set('age', filters.age.toString())
  }

  if (filters.teacherId) {
    params.set('teacher', filters.teacherId)
  }

  if (filters.complexity) {
    params.set('complexity', filters.complexity)
  }

  if (filters.courseType) {
    params.set('courseType', filters.courseType)
  }

  if (filters.weekdays && filters.weekdays.length > 0) {
    params.set('weekdays', filters.weekdays.join(','))
  }

  if (filters.priceRange && filters.priceRange.length === 2) {
    params.set('priceMin', filters.priceRange[0].toString())
    params.set('priceMax', filters.priceRange[1].toString())
  }

  if (filters.timeSlot) {
    params.set('timeSlot', filters.timeSlot)
  }

  return params
}

/**
 * Преобразует URL search params в фильтры
 */
export function searchParamsToFilters(searchParams: URLSearchParams | ReadonlyURLSearchParams): CourseFilters {
  const filters: CourseFilters = {}

  const direction = searchParams.get('direction')
  if (direction) {
    filters.direction = direction
  }

  const format = searchParams.get('format')
  if (format === 'online' || format === 'offline') {
    filters.format = format
  }

  const city = searchParams.get('city')
  if (city) {
    filters.city = city
  }

  const age = searchParams.get('age')
  if (age) {
    const ageNum = parseInt(age, 10)
    if (!isNaN(ageNum)) {
      filters.age = ageNum
    }
  }

  const teacher = searchParams.get('teacher')
  if (teacher) {
    filters.teacherId = teacher
  }

  const complexity = searchParams.get('complexity')
  if (complexity === 'beginner' || complexity === 'experienced' || complexity === 'professional') {
    filters.complexity = complexity
  }

  const courseType = searchParams.get('courseType')
  if (courseType === 'club' || courseType === 'course' || courseType === 'intensive' || courseType === 'individual') {
    filters.courseType = courseType
  }

  const weekdays = searchParams.get('weekdays')
  if (weekdays) {
    filters.weekdays = weekdays.split(',').filter(Boolean)
  }

  const priceMin = searchParams.get('priceMin')
  const priceMax = searchParams.get('priceMax')
  if (priceMin && priceMax) {
    const min = parseInt(priceMin, 10)
    const max = parseInt(priceMax, 10)
    if (!isNaN(min) && !isNaN(max)) {
      filters.priceRange = [min, max]
    }
  }

  const timeSlot = searchParams.get('timeSlot')
  if (timeSlot === 'morning' || timeSlot === 'afternoon' || timeSlot === 'evening') {
    filters.timeSlot = timeSlot
  }

  return filters
}

/**
 * Создает URL с фильтрами
 */
export function createUrlWithFilters(basePath: string, filters: CourseFilters): string {
  const params = filtersToSearchParams(filters)
  const paramString = params.toString()
  return paramString ? `${basePath}?${paramString}` : basePath
}

/**
 * Проверяет, изменились ли фильтры
 */
export function filtersChanged(oldFilters: CourseFilters, newFilters: CourseFilters): boolean {
  return JSON.stringify(oldFilters) !== JSON.stringify(newFilters)
}