"use client"

import { useState, useEffect } from "react"
import { TeacherFilter, FormatFilter } from "@/features/courses-filters/ui"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RotateCcw } from "lucide-react"

type UserRole = 'Manager' | 'Teacher'

interface DashboardCoursesFiltersProps {
  onFiltersChange: (filters: DashboardCoursesFilterValues) => void
  className?: string
  role?: UserRole
}

export interface DashboardCoursesFilterValues {
  teacher: string | null
  format: 'online' | 'offline' | undefined
  month: number | undefined
  year: number | undefined
}

export function DashboardCoursesFilters({ onFiltersChange, className, role = 'Manager' }: DashboardCoursesFiltersProps) {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // getMonth() возвращает 0-11, нужно 1-12

  const [filters, setFilters] = useState<DashboardCoursesFilterValues>({
    teacher: null,
    format: undefined,
    month: currentMonth,
    year: currentYear
  })

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i) // 2 года назад до 2 лет вперед

  const months = [
    { value: 1, label: 'Январь' },
    { value: 2, label: 'Февраль' },
    { value: 3, label: 'Март' },
    { value: 4, label: 'Апрель' },
    { value: 5, label: 'Май' },
    { value: 6, label: 'Июнь' },
    { value: 7, label: 'Июль' },
    { value: 8, label: 'Август' },
    { value: 9, label: 'Сентябрь' },
    { value: 10, label: 'Октябрь' },
    { value: 11, label: 'Ноябрь' },
    { value: 12, label: 'Декабрь' }
  ]

  // Вызываем onFiltersChange с начальными значениями при монтировании компонента
  useEffect(() => {
    onFiltersChange(filters)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilters = (newFilters: Partial<DashboardCoursesFilterValues>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const handleTeacherChange = (teacherId: string | null) => {
    updateFilters({ teacher: teacherId })
  }

  const handleFormatChange = (format: 'online' | 'offline' | undefined) => {
    updateFilters({ format })
  }

  const handleMonthChange = (month: string) => {
    const monthValue = month === 'all' ? undefined : parseInt(month)
    updateFilters({ month: monthValue })
  }

  const handleYearChange = (year: string) => {
    const yearValue = year === 'all' ? undefined : parseInt(year)
    updateFilters({ year: yearValue })
  }

  const handleReset = () => {
    const resetFilters = {
      teacher: null,
      format: undefined,
      month: currentMonth,
      year: currentYear
    }
    setFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const hasActiveFilters = filters.teacher || filters.format || 
    (filters.month && filters.month !== currentMonth) || 
    (filters.year && filters.year !== currentYear)

  return (
    <div className={className}>
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Фильтры курсов</h3>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Сбросить
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Фильтр по преподавателю - только для менеджеров */}
          {role === 'Manager' && (
            <div className="space-y-2">
              <Label>Преподаватель</Label>
              <TeacherFilter
                value={filters.teacher}
                onTeacherChange={handleTeacherChange}
              />
            </div>
          )}

          {/* Фильтр по формату */}
          <div className="space-y-2">
            <Label>Формат</Label>
            <FormatFilter
              value={filters.format}
              onFormatAndLocationChange={(format) => handleFormatChange(format)}
            />
          </div>

          {/* Фильтр по месяцу */}
          <div className="space-y-2">
            <Label>Месяц</Label>
            <Select 
              value={filters.month?.toString() || 'all'} 
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-auto">
                <SelectValue placeholder="Все месяцы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все месяцы</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Фильтр по году */}
          <div className="space-y-2">
            <Label>Год</Label>
            <Select 
              value={filters.year?.toString() || 'all'} 
              onValueChange={handleYearChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Все годы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все годы</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Индикатор активных фильтров */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Активные фильтры:</span>
            {role === 'Manager' && filters.teacher && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">
                Преподаватель выбран
              </span>
            )}
            {filters.format && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                {filters.format === 'online' ? 'Онлайн' : 'Оффлайн'}
              </span>
            )}
            {filters.month && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md text-xs">
                {months.find(m => m.value === filters.month)?.label}
              </span>
            )}
            {filters.year && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md text-xs">
                {filters.year}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}