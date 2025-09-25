"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface YearFilterProps {
  value?: number
  onYearChange: (year: number | undefined) => void
  placeholder?: string
  showAllOption?: boolean
  className?: string
  yearsRange?: number // Количество лет в диапазоне (по умолчанию 5)
}

export function YearFilter({
  value,
  onYearChange,
  placeholder = "Выберите год",
  showAllOption = true,
  className,
  yearsRange = 5
}: YearFilterProps) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: yearsRange }, (_, i) => currentYear - 2 + i)

  const handleChange = (selectedValue: string) => {
    if (selectedValue === 'all') {
      onYearChange(undefined)
    } else {
      onYearChange(parseInt(selectedValue))
    }
  }

  return (
    <Select
      value={value?.toString() || (showAllOption ? 'all' : '')}
      onValueChange={handleChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption && (
          <SelectItem value="all">Все годы</SelectItem>
        )}
        {years.map((year) => (
          <SelectItem key={year} value={year.toString()}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}