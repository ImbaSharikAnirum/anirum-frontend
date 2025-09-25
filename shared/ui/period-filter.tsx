"use client"

import { MonthFilter } from "./month-filter"
import { YearFilter } from "./year-filter"
import { Label } from "@/components/ui/label"

export interface PeriodFilterValues {
  month?: number
  year?: number
}

interface PeriodFilterProps {
  value: PeriodFilterValues
  onPeriodChange: (period: PeriodFilterValues) => void
  showLabels?: boolean
  className?: string
  monthClassName?: string
  yearClassName?: string
  showAllOptions?: boolean
}

export function PeriodFilter({
  value,
  onPeriodChange,
  showLabels = true,
  className,
  monthClassName,
  yearClassName,
  showAllOptions = true
}: PeriodFilterProps) {
  const handleMonthChange = (month: number | undefined) => {
    onPeriodChange({ ...value, month })
  }

  const handleYearChange = (year: number | undefined) => {
    onPeriodChange({ ...value, year })
  }

  return (
    <div className={`flex flex-wrap gap-3 ${className || ''}`}>
      {/* Фильтр по месяцу */}
      <div className="space-y-2">
        {showLabels && <Label>Месяц</Label>}
        <MonthFilter
          value={value.month}
          onMonthChange={handleMonthChange}
          showAllOption={showAllOptions}
          className={monthClassName}
        />
      </div>

      {/* Фильтр по году */}
      <div className="space-y-2">
        {showLabels && <Label>Год</Label>}
        <YearFilter
          value={value.year}
          onYearChange={handleYearChange}
          showAllOption={showAllOptions}
          className={yearClassName}
        />
      </div>
    </div>
  )
}