import React from 'react'
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { type AttendanceStatus } from "@/entities/invoice"

interface StudentAttendanceCellProps {
  status: AttendanceStatus
  isPending: boolean
  hasError: boolean
  onClick: () => void
}

export function StudentAttendanceCell({ 
  status, 
  isPending,
  hasError,
  onClick
}: StudentAttendanceCellProps) {
  const getIcon = () => {
    if (isPending) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    }

    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`w-8 h-8 p-0 hover:bg-gray-100 ${
        hasError ? 'ring-2 ring-red-200' : ''
      } ${
        isPending ? 'opacity-70' : ''
      }`}
      disabled={isPending}
      title={
        hasError 
          ? 'Ошибка сохранения, попробуйте еще раз' 
          : `Текущий статус: ${
              status === 'present' ? 'Присутствует' :
              status === 'absent' ? 'Отсутствует' :
              'Не отмечено'
            }`
      }
    >
      {getIcon()}
    </Button>
  )
}