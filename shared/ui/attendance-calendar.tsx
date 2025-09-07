"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Circle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  generateCourseDates, 
  formatAttendanceDate, 
  getAttendanceStatus,
  updateAttendanceStatus 
} from "@/shared/lib/attendance-utils"

interface AttendanceCalendarProps {
  studentId: string
  studentName: string
  courseStartDate: string
  courseEndDate: string
  weekdays: string[]
  className?: string
}

type AttendanceStatus = 'present' | 'absent' | 'unknown'

export function AttendanceCalendar({
  studentId,
  studentName,
  courseStartDate,
  courseEndDate,
  weekdays,
  className
}: AttendanceCalendarProps) {
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({})

  const courseDates = generateCourseDates(courseStartDate, courseEndDate, weekdays)

  const handleAttendanceToggle = async (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    const currentStatus = attendanceMap[dateKey] || getAttendanceStatus(studentId, date)
    
    let newStatus: AttendanceStatus
    if (currentStatus === 'unknown' || currentStatus === 'absent') {
      newStatus = 'present'
    } else {
      newStatus = 'absent'
    }

    // Обновляем локальное состояние
    setAttendanceMap(prev => ({
      ...prev,
      [dateKey]: newStatus
    }))

    // Отправляем на сервер (пока заглушка)
    // if (newStatus !== 'unknown') {
    //   try {
    //     await updateAttendanceStatus(studentId, date, newStatus)
    //   } catch (error) {
    //     // В случае ошибки откатываем изменения
    //     setAttendanceMap(prev => ({
    //       ...prev,
    //       [dateKey]: currentStatus
    //     }))
    //   }
    // }
  }

  const getStatusIcon = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    const status = attendanceMap[dateKey] || getAttendanceStatus(studentId, date)
    
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getButtonClasses = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0]
    const status = attendanceMap[dateKey] || getAttendanceStatus(studentId, date)
    
    const baseClasses = "w-12 h-12 p-1 text-xs hover:bg-gray-100 transition-colors"
    
    if (status === 'present') {
      return cn(baseClasses, "bg-green-50 hover:bg-green-100 border-green-200")
    } else if (status === 'absent') {
      return cn(baseClasses, "bg-red-50 hover:bg-red-100 border-red-200")
    } else {
      return cn(baseClasses, "bg-gray-50")
    }
  }

  if (courseDates.length === 0) {
    return (
      <div className={cn("text-center text-gray-500 text-sm", className)}>
        Нет занятий в указанном периоде
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="h-4 w-4" />
        <span className="text-sm font-medium">Посещаемость:</span>
        <span className="text-sm text-gray-600">{studentName}</span>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {courseDates.map((courseDate, index) => {
          const { date, isToday, isPast, isFuture } = courseDate
          
          return (
            <div key={index} className="flex flex-col items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAttendanceToggle(date)}
                className={cn(
                  getButtonClasses(date),
                  isToday && "ring-2 ring-blue-500",
                  isFuture && "opacity-60 cursor-default"
                )}
                disabled={isFuture}
              >
                <div className="flex flex-col items-center gap-1">
                  {getStatusIcon(date)}
                  <span className="leading-none">
                    {formatAttendanceDate(date)}
                  </span>
                </div>
              </Button>
            </div>
          )
        })}
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Присутствовал</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-3 w-3 text-red-600" />
          <span>Отсутствовал</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3 text-gray-400" />
          <span>Не отмечено</span>
        </div>
      </div>
    </div>
  )
}