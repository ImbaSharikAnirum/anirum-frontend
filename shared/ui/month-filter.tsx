"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface MonthFilterProps {
  value?: number
  onMonthChange: (month: number | undefined) => void
  placeholder?: string
  showAllOption?: boolean
  className?: string
}

export function MonthFilter({
  value,
  onMonthChange,
  placeholder = "Выберите месяц",
  showAllOption = true,
  className
}: MonthFilterProps) {
  const handleChange = (selectedValue: string) => {
    if (selectedValue === 'all') {
      onMonthChange(undefined)
    } else {
      onMonthChange(parseInt(selectedValue))
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
          <SelectItem value="all">Все месяцы</SelectItem>
        )}
        {months.map((month) => (
          <SelectItem key={month.value} value={month.value.toString()}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}