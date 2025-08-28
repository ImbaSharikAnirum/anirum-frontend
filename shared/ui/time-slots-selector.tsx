"use client"

import { useId } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface TimeSlotsSelectorProps {
  selectedTimeSlot: string
  onTimeSlotChange: (timeSlot: string) => void
}

export function TimeSlotsSelector({ selectedTimeSlot, onTimeSlotChange }: TimeSlotsSelectorProps) {
  const id = useId()

  const items = [
    { value: "morning", label: "Утро", timeRange: "09:00-12:00" },
    { value: "afternoon", label: "День", timeRange: "12:00-17:00" },
    { value: "evening", label: "Вечер", timeRange: "17:00-21:00" },
  ]

  const handleTimeSlotToggle = (timeSlotValue: string) => {
    // Если клик по уже выбранному слоту - сбрасываем, иначе выбираем новый
    const newSelectedTimeSlot = selectedTimeSlot === timeSlotValue ? "" : timeSlotValue
    onTimeSlotChange(newSelectedTimeSlot)
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        Время занятий
      </legend>
      <div className="flex gap-2">
        {items.map((item) => (
          <label
            key={`${id}-${item.value}`}
            className="border-input has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative flex h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border text-center shadow-xs transition-[color,box-shadow] outline-none has-focus-visible:ring-[3px] has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50"
          >
            <Checkbox
              id={`${id}-${item.value}`}
              value={item.value}
              className="sr-only after:absolute after:inset-0"
              checked={selectedTimeSlot === item.value}
              onCheckedChange={() => handleTimeSlotToggle(item.value)}
            />
            <span aria-hidden="true" className="text-sm font-medium">
              {item.label}
            </span>
            <span aria-hidden="true" className="text-xs text-muted-foreground">
              {item.timeRange}
            </span>
            <span className="sr-only">{item.label} с {item.timeRange}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}