"use client"

import { useId } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface WeekDaysSelectorProps {
  selectedDays: string[]
  onDaysChange: (days: string[]) => void
}

export function WeekDaysSelector({ selectedDays, onDaysChange }: WeekDaysSelectorProps) {
  const id = useId()

  const items = [
    { value: "monday", label: "Monday", shortLabel: "Пн" },
    { value: "tuesday", label: "Tuesday", shortLabel: "Вт" },
    { value: "wednesday", label: "Wednesday", shortLabel: "Ср" },
    { value: "thursday", label: "Thursday", shortLabel: "Чт" },
    { value: "friday", label: "Friday", shortLabel: "Пт" },
    { value: "saturday", label: "Saturday", shortLabel: "Сб" },
    { value: "sunday", label: "Sunday", shortLabel: "Вс" },
  ]

  const handleDayToggle = (dayValue: string) => {
    const newSelectedDays = selectedDays.includes(dayValue)
      ? selectedDays.filter(day => day !== dayValue)
      : [...selectedDays, dayValue]
    
    onDaysChange(newSelectedDays)
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        Дни недели
      </legend>
      <div className="flex gap-1.5">
        {items.map((item) => (
          <label
            key={`${id}-${item.value}`}
            className="border-input has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50"
          >
            <Checkbox
              id={`${id}-${item.value}`}
              value={item.value}
              className="sr-only after:absolute after:inset-0"
              checked={selectedDays.includes(item.value)}
              onCheckedChange={() => handleDayToggle(item.value)}
            />
            <span aria-hidden="true" className="text-sm font-medium">
              {item.shortLabel}
            </span>
            <span className="sr-only">{item.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}