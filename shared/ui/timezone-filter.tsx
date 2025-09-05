"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { TIMEZONES } from "@/shared/lib/timezone"

interface TimezoneFilterProps {
  value?: string
  onTimezoneChange?: (timezone: string) => void
  placeholder?: string
  className?: string
}

export function TimezoneFilter({ 
  value = "Europe/Moscow", 
  onTimezoneChange, 
  placeholder = "Часовой пояс",
  className 
}: TimezoneFilterProps) {
  const [open, setOpen] = useState(false)

  const timezoneOptions = TIMEZONES.map(timezone => ({
    value: timezone.value,
    label: timezone.label
  }))

  const selectedTimezone = timezoneOptions.find((timezone) => timezone.value === value)

  const handleSelect = (currentValue: string) => {
    setOpen(false)
    onTimezoneChange?.(currentValue)
  }

  const handleClear = () => {
    onTimezoneChange?.("Europe/Moscow") // Возврат к дефолтному значению
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTimezone ? (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="truncate">{selectedTimezone.label}</span>
                </div>
                {value !== "Europe/Moscow" && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClear()
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        handleClear()
                      }
                    }}
                  >
                    ×
                  </span>
                )}
              </>
            ) : (
              <>
                <span>{placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Поиск часового пояса..." />
            <CommandList className="max-h-60">
              <CommandEmpty>Часовой пояс не найден</CommandEmpty>
              <CommandGroup>
                {timezoneOptions.map((timezone) => (
                  <CommandItem
                    key={timezone.value}
                    value={timezone.value}
                    onSelect={handleSelect}
                    keywords={[timezone.label]} // Для лучшего поиска
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === timezone.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Clock className="mr-2 h-4 w-4 opacity-50" />
                    {timezone.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}