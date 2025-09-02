"use client"

import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { courseTeachers, CourseTeacher } from "@/features/courses-filters"

interface MobileTeacherSelectorProps {
  selectedTeacher: string
  tempSelectedTeacher: string
  expanded: boolean
  onTeacherSelect: (teacherValue: string) => void
  onToggleExpanded: () => void
}

export function MobileTeacherSelector({
  selectedTeacher,
  tempSelectedTeacher,
  expanded,
  onTeacherSelect,
  onToggleExpanded
}: MobileTeacherSelectorProps) {
  const tempSelectedTeacherObj = courseTeachers.find((teacher) => teacher.value === tempSelectedTeacher)

  return (
    <Card className="p-4">
      {!expanded ? (
        <button 
          className="w-full text-left"
          onClick={onToggleExpanded}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-medium">Преподаватель</h3>
            <div className="text-sm text-gray-500 truncate max-w-[120px] text-right">
              {tempSelectedTeacherObj ? tempSelectedTeacherObj.label : "Выберите преподавателя"}
            </div>
          </div>
        </button>
      ) : (
        <div>
          <h3 className="text-base font-medium mb-3">Преподаватель</h3>
          <Command className="border rounded-lg">
            <CommandInput placeholder="Поиск преподавателя..." />
            <CommandList className="max-h-40">
              <CommandEmpty>Преподаватель не найден</CommandEmpty>
              <CommandGroup>
                {courseTeachers.map((teacher) => (
                  <CommandItem
                    key={teacher.value}
                    value={teacher.value}
                    onSelect={() => onTeacherSelect(teacher.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        tempSelectedTeacher === teacher.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {teacher.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </Card>
  )
}