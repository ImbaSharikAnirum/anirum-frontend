"use client"

import { Card } from "@/components/ui/card"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useTeachers } from "@/entities/user"

interface MobileTeacherSelectorProps {
  selectedTeacher: string | null
  tempSelectedTeacher: string | null
  expanded: boolean
  onTeacherSelect: (teacherId: string | null) => void
  onToggleExpanded: () => void
}

export function MobileTeacherSelector({
  selectedTeacher,
  tempSelectedTeacher,
  expanded,
  onTeacherSelect,
  onToggleExpanded
}: MobileTeacherSelectorProps) {
  const { teachers, loading, error } = useTeachers()
  
  const tempSelectedTeacherObj = teachers.find((teacher) => (teacher.documentId || teacher.id.toString()) === tempSelectedTeacher)

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2">Загрузка преподавателей...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-center text-red-500">
          Ошибка: {error}
        </div>
      </Card>
    )
  }

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
              {tempSelectedTeacherObj ? tempSelectedTeacherObj.username : "Выберите преподавателя"}
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
                {teachers.map((teacher) => (
                  <CommandItem
                    key={teacher.documentId || teacher.id}
                    value={teacher.username}
                    onSelect={() => {
                      const teacherDocId = teacher.documentId || teacher.id.toString()
                      onTeacherSelect(teacherDocId === tempSelectedTeacher ? null : teacherDocId)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        tempSelectedTeacher === (teacher.documentId || teacher.id.toString()) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {teacher.username}
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