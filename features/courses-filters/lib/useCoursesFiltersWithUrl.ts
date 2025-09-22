/**
 * Хук для управления фильтрами курсов с синхронизацией URL
 * @layer features
 */

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CourseFilters } from '@/entities/course/lib/filters'
import {
  filtersToSearchParams,
  searchParamsToFilters,
  filtersChanged
} from '@/shared/lib/url-filters'
import type { LocationData } from '@/features/courses-filters/ui'

export function useCoursesFiltersWithUrl() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Инициализируем фильтры из URL
  const [filters, setFilters] = useState<CourseFilters>(() => {
    return searchParams ? searchParamsToFilters(searchParams) : {}
  })

  // Синхронизируем изменения фильтров с URL
  const updateFiltersAndUrl = useCallback((newFilters: CourseFilters) => {
    setFilters(prev => {
      if (!filtersChanged(prev, newFilters)) {
        return prev
      }

      // Отложенное обновление URL чтобы избежать ошибки setState в рендере
      setTimeout(() => {
        const params = filtersToSearchParams(newFilters)
        const newUrl = params.toString() ? `/courses?${params.toString()}` : '/courses'
        router.replace(newUrl, { scroll: false })
      }, 0)

      return newFilters
    })
  }, [router])

  const updateFilter = useCallback(<K extends keyof CourseFilters>(
    key: K,
    value: CourseFilters[K]
  ) => {
    const newFilters = {
      ...filters,
      [key]: value
    }
    updateFiltersAndUrl(newFilters)
  }, [filters, updateFiltersAndUrl])

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
    const newFilters = {
      ...filters,
      format,
      city: format === 'online' ? undefined : locationData?.city
    }
    updateFiltersAndUrl(newFilters)
  }, [filters, updateFiltersAndUrl])

  const clearFilters = useCallback(() => {
    updateFiltersAndUrl({})
  }, [updateFiltersAndUrl])

  const clearFilter = useCallback((key: keyof CourseFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    updateFiltersAndUrl(newFilters)
  }, [filters, updateFiltersAndUrl])

  // Синхронизируем с внешними изменениями URL (кнопка назад/вперед)
  useEffect(() => {
    if (searchParams) {
      const urlFilters = searchParamsToFilters(searchParams)
      if (filtersChanged(filters, urlFilters)) {
        setFilters(urlFilters)
      }
    }
  }, [searchParams]) // Исключаем filters из зависимостей чтобы избежать циклов

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