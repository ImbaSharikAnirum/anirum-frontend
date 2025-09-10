"use client"

import { Card } from "@/components/ui/card"
import { Check, Loader2, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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
            <div className="flex items-center gap-2 text-sm text-gray-500 truncate max-w-[140px]">
              {tempSelectedTeacherObj ? (
                <>
                  <Avatar className="h-4 w-4">
                    <AvatarImage
                      src={tempSelectedTeacherObj.avatar ? (typeof tempSelectedTeacherObj.avatar === 'string' ? tempSelectedTeacherObj.avatar : tempSelectedTeacherObj.avatar?.url) : undefined}
                      alt="Преподаватель"
                    />
                    <AvatarFallback>
                      <User className="h-2 w-2" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {`${tempSelectedTeacherObj.name || tempSelectedTeacherObj.username} ${tempSelectedTeacherObj.family || ''}`.trim()}
                  </span>
                </>
              ) : (
                "Выберите преподавателя"
              )}
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
                    value={`${teacher.name || teacher.username} ${teacher.family || ''}`.trim()}
                    onSelect={() => {
                      const teacherDocId = teacher.documentId || teacher.id.toString()
                      onTeacherSelect(teacherDocId === tempSelectedTeacher ? null : teacherDocId)
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={teacher.avatar ? (typeof teacher.avatar === 'string' ? teacher.avatar : teacher.avatar?.url) : undefined}
                            alt="Преподаватель"
                            className="object-cover"
                          />
                          <AvatarFallback>
                            <User className="h-2.5 w-2.5" />
                          </AvatarFallback>
                        </Avatar>
                        <span>{`${teacher.name || teacher.username} ${teacher.family || ''}`.trim()}</span>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 ml-2",
                          tempSelectedTeacher === (teacher.documentId || teacher.id.toString()) ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
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