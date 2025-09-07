'use client'

import { Progress } from '@/components/ui/progress'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseEnrollmentProgressProps {
  currentStudents: number
  minStudents: number
  maxStudents: number
  className?: string
}

export function CourseEnrollmentProgress({ 
  currentStudents, 
  minStudents, 
  maxStudents, 
  className 
}: CourseEnrollmentProgressProps) {
  // Прогресс от 0 до максимума, а не до минимума
  const progressPercentage = (currentStudents / maxStudents) * 100
  const isMinimumReached = currentStudents >= minStudents
  // Позиция минимума на прогресс-баре
  const minimumPosition = (minStudents / maxStudents) * 100

  return (
    <div className={cn("space-y-1", className)}>
      {/* Статус записи */}
      <div className="flex items-center justify-between text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>
            {isMinimumReached ? "Гарантированный старт" : "Идет набор"}
          </span>
        </div>
        <span className="">
          {currentStudents}/{maxStudents}
        </span>
      </div>

      {/* Прогресс-бар (показываем всегда) */}
      <div className="space-y-1">
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-gray-400 h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          {/* Отметка минимума - треугольник */}
          <div 
            className="absolute -top-1.5 flex items-center justify-center" 
            style={{ left: `${minimumPosition}%`, transform: 'translateX(-50%)' }}
          >
            {/* Треугольник вверх */}
            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-500"></div>
          </div>
        </div>
        <div className="flex justify-between items-start text-xs text-gray-500 space-y-1">
          <span>
            {isMinimumReached 
              ? "Минимум участников набран — осталось только занять место" 
              : `Для запуска нужно минимум ${minStudents} участников`
            }
          </span>
          <span className="whitespace-nowrap">до {maxStudents} макс.</span>
        </div>
      </div>
    </div>
  )
}