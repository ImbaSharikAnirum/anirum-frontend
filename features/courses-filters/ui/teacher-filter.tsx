"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, User, Loader2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
import { useTeachers } from "@/entities/user"

interface TeacherFilterProps {
  value?: string | null
  onTeacherChange?: (documentId: string | null) => void
}

export function TeacherFilter({ value, onTeacherChange }: TeacherFilterProps) {
  const [open, setOpen] = useState(false)
  const stringValue = value || ""
  const { teachers, loading, error } = useTeachers()

  // Используем documentId для Strapi 5
  const teacherOptions = teachers.map(teacher => ({
    value: teacher.documentId || teacher.id.toString(),
    label: `${teacher.name || teacher.username} ${teacher.family || ''}`.trim(),
    name: teacher.name || teacher.username,
    family: teacher.family || '',
    avatar: teacher.avatar
  }))

  const selectedTeacher = teacherOptions.find((teacher) => teacher.value === stringValue)

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === stringValue ? "" : currentValue
    setOpen(false)
    
    // Вызываем коллбэк с documentId или null
    onTeacherChange?.(newValue || null)
  }

  const handleClear = () => {
    onTeacherChange?.(null)
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
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={selectedTeacher.avatar ? (typeof selectedTeacher.avatar === 'string' ? selectedTeacher.avatar : selectedTeacher.avatar?.url) : undefined}
                      alt="Преподаватель"
                    />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
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
                <span>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : error ? (
                    "Ошибка загрузки"
                  ) : (
                    "Преподаватель"
                  )}
                </span>
                {!loading && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Поиск преподавателя..." />
            <CommandList className="max-h-40">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Загрузка преподавателей...</span>
                </div>
              ) : error ? (
                <div className="px-2 py-4 text-sm text-red-500">
                  Ошибка: {error}
                </div>
              ) : (
                <>
                  <CommandEmpty>Преподаватель не найден</CommandEmpty>
                  <CommandGroup>
                    {teacherOptions.map((teacher) => (
                      <CommandItem
                        key={teacher.value}
                        value={teacher.value}
                        onSelect={handleSelect}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={teacher.avatar ? (typeof teacher.avatar === 'string' ? teacher.avatar : teacher.avatar?.url) : undefined}
                                alt="Преподаватель"
                                className="object-cover"
                              />
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <span>{teacher.name} {teacher.family}</span>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4 ml-2",
                              stringValue === teacher.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}