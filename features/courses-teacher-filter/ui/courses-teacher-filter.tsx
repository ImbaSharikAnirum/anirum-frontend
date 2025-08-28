"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"
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

// Список преподавателей
const teachers = [
  { value: "anna-petrova", label: "Анна Петрова" },
  { value: "mikhail-ivanov", label: "Михаил Иванов" },
  { value: "elena-sidorova", label: "Елена Сидорова" },
  { value: "dmitry-kozlov", label: "Дмитрий Козлов" },
  { value: "olga-morozova", label: "Ольга Морозова" },
  { value: "artem-volkov", label: "Артем Волков" },
  { value: "maria-novikova", label: "Мария Новикова" },
  { value: "sergey-fedorov", label: "Сергей Федоров" },
  { value: "tatyana-lebedeva", label: "Татьяна Лебедева" },
  { value: "nikolay-orlov", label: "Николай Орлов" },
  { value: "ekaterina-sokolova", label: "Екатерина Соколова" },
  { value: "andrey-pavlov", label: "Андрей Павлов" },
]

export function CoursesTeacherFilter() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  const selectedTeacher = teachers.find((teacher) => teacher.value === value)

  const handleSelect = (currentValue: string) => {
    setValue(currentValue === value ? "" : currentValue)
    setOpen(false)
  }

  const handleClear = () => {
    setValue("")
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedTeacher ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="truncate max-w-32">{selectedTeacher.label}</span>
                </div>
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
              </>
            ) : (
              <>
                <span>Преподаватель</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Поиск преподавателя..." />
            <CommandList>
              <CommandEmpty>Преподаватель не найден</CommandEmpty>
              <CommandGroup>
                {teachers.map((teacher) => (
                  <CommandItem
                    key={teacher.value}
                    value={teacher.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === teacher.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {teacher.label}
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