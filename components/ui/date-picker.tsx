"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import {
  Button,
  DatePicker as AriaDatePicker,
  Dialog,
  Group,
  Label,
  Popover,
} from "react-aria-components"
import { parseDate } from "@internationalized/date"

import { Calendar } from "@/components/ui/calendar-rac"
import { DateInput } from "@/components/ui/datefield-rac"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  label?: string
  showLabel?: boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "дд.мм.гггг",
  className,
  label,
  showLabel = false
}: DatePickerProps) {
  const formatDateToCalendarDate = (date: Date) => {
    try {
      // Проверяем, что дата валидная
      if (!date || isNaN(date.getTime())) {
        return null
      }
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      // Проверяем корректность года (должен быть 4-значным)
      if (year < 1000 || year > 9999) {
        return null
      }
      
      const dateString = `${year}-${month}-${day}`
      return parseDate(dateString)
    } catch (error) {
      console.warn('Invalid date format:', error)
      return null
    }
  }

  const formatCalendarDateToDate = (calendarDate: any) => {
    try {
      if (!calendarDate || !calendarDate.year || !calendarDate.month || !calendarDate.day) {
        return undefined
      }
      
      // Проверяем валидность значений
      if (calendarDate.year < 1000 || calendarDate.year > 9999) {
        return undefined
      }
      if (calendarDate.month < 1 || calendarDate.month > 12) {
        return undefined
      }
      if (calendarDate.day < 1 || calendarDate.day > 31) {
        return undefined
      }
      
      const date = new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day)
      
      // Проверяем, что созданная дата валидная
      if (isNaN(date.getTime())) {
        return undefined
      }
      
      return date
    } catch (error) {
      console.warn('Invalid calendar date format:', error)
      return undefined
    }
  }

  const [internalValue, setInternalValue] = React.useState(
    selected ? formatDateToCalendarDate(selected) : null
  )

  // Обновляем внутреннее значение когда selected изменяется извне
  React.useEffect(() => {
    const newValue = selected ? formatDateToCalendarDate(selected) : null
    setInternalValue(newValue)
  }, [selected])

  return (
    <AriaDatePicker 
      className={cn("*:not-first:mt-2", className)}
      value={internalValue}
      onChange={(date) => {
        setInternalValue(date)
        onSelect?.(formatCalendarDateToDate(date))
      }}
    >
      {showLabel && label && (
        <Label className="text-foreground text-sm font-medium">{label}</Label>
      )}
      <div className="flex">
        <Group className="w-auto">
          <DateInput className="pe-9" />
        </Group>
        <Button className="text-muted-foreground/80 hover:text-foreground data-focus-visible:border-ring data-focus-visible:ring-ring/50 z-10 -ms-9 -me-px flex w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none data-focus-visible:ring-[3px]">
          <CalendarIcon size={16} />
        </Button>
      </div>
      <Popover
        className="bg-background text-popover-foreground data-entering:animate-in data-exiting:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 rounded-lg border shadow-lg outline-hidden"
        offset={4}
      >
        <Dialog className="max-h-[inherit] overflow-auto p-2">
          <Calendar />
        </Dialog>
      </Popover>
    </AriaDatePicker>
  )
}
