/**
 * Хук для управления фильтрами курсов
 * @layer features
 */

import { useState, useCallback } from 'react'
import { CourseFilters } from '@/entities/course/lib/filters'
import type { LocationData } from '@/features/courses-filters/ui'

export function useCoursesFilters(initialFilters: CourseFilters = {}) {
  const [filters, setFilters] = useState<CourseFilters>(initialFilters)

  const updateFilter = useCallback(<K extends keyof CourseFilters>(
    key: K,
    value: CourseFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const setDirection = useCallback((direction: string | undefined) => {
    updateFilter('direction', direction)
  }, [updateFilter])

  const setFormat = useCallback((format: 'online' | 'offline' | undefined) => {
    updateFilter('format', format)
  }, [updateFilter])

  const setAge = useCallback((age: number | undefined) => {
    updateFilter('age', age)
  }, [updateFilter])

  const setTeacher = useCallback((teacherId: string | null | undefined) => {
    updateFilter('teacherId', teacherId || undefined)
  }, [updateFilter])

  const setComplexity = useCallback((complexity: 'beginner' | 'experienced' | 'professional' | undefined) => {
    updateFilter('complexity', complexity)
  }, [updateFilter])

  const setCourseType = useCallback((courseType: 'club' | 'course' | 'intensive' | 'individual' | undefined) => {
    updateFilter('courseType', courseType)
  }, [updateFilter])

  const setWeekdays = useCallback((weekdays: string[] | undefined) => {
    updateFilter('weekdays', weekdays)
  }, [updateFilter])

  const setPriceRange = useCallback((priceRange: [number, number] | undefined) => {
    updateFilter('priceRange', priceRange)
  }, [updateFilter])

  const setTimeSlot = useCallback((timeSlot: 'morning' | 'afternoon' | 'evening' | undefined) => {
    updateFilter('timeSlot', timeSlot)
  }, [updateFilter])

  const setCity = useCallback((city: string | undefined) => {
    updateFilter('city', city)
  }, [updateFilter])

  // Комбинированный метод для формата и города
  const setFormatAndLocation = useCallback((format: 'online' | 'offline' | undefined, locationData?: LocationData) => {
    setFilters(prev => ({
      ...prev,
      format,
      city: format === 'online' ? undefined : locationData?.city
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const clearFilter = useCallback((key: keyof CourseFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }, [])

  return {
    filters,
    setDirection,
    setFormat,
    setCity,
    setFormatAndLocation,
    setAge,
    setTeacher,
    setComplexity,
    setCourseType,
    setWeekdays,
    setPriceRange,
    setTimeSlot,
    clearFilters,
    clearFilter,
    updateFilter
  }
}