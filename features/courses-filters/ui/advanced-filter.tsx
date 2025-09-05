"use client"

import { useState, useEffect, useCallback } from "react"
import { Filter, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { WeekDaysSelector } from "@/shared/ui/week-days-selector"
import { PriceSliderWithHistogram } from "@/shared/ui/price-slider-with-histogram"
import { TimeSlotsSelector } from "@/shared/ui/time-slots-selector"
import { CourseFilters } from "@/entities/course/lib/filters"

interface AdvancedFilters {
  days: string[]
  price: number[]
  timeSlot: string
}

interface AdvancedFilterProps {
  variant?: 'default' | 'icon-only'
  mobile?: boolean
  // Основные фильтры от родительского компонента
  baseFilters?: CourseFilters
  // Общее количество курсов с базовыми фильтрами (уже загружено)
  baseCourseCount?: number
  // Callback для получения count с расширенными фильтрами
  onCountCourses?: (baseFilters: CourseFilters, advancedFilters: AdvancedFilters) => Promise<number>
  // Callback для применения расширенных фильтров
  onApplyAdvancedFilters?: (filters: AdvancedFilters) => void
}

export function AdvancedFilter({ 
  variant = 'default', 
  mobile = false, 
  baseFilters = {},
  baseCourseCount = 0,
  onCountCourses,
  onApplyAdvancedFilters 
}: AdvancedFilterProps) {
  const [open, setOpen] = useState(false)
  const [coursesCount, setCoursesCount] = useState<number>(0)
  
  // Применённые фильтры (постоянные)
  const [appliedFilters, setAppliedFilters] = useState({
    days: [] as string[],
    price: [0, 10000] as number[],
    timeSlot: "",
  })
  
  // Временные состояния для диалога
  const [tempSelectedDays, setTempSelectedDays] = useState<string[]>([])
  const [tempPriceRange, setTempPriceRange] = useState([0, 10000])
  const [tempSelectedTimeSlot, setTempSelectedTimeSlot] = useState("")

  // Функция подсчета курсов с учетом всех фильтров
  const updateCoursesCount = useCallback(async (days: string[], price: number[], timeSlot: string) => {
    // Если нет расширенных фильтров, используем базовый count
    const hasCustomPrice = !(price[0] === 0 && price[1] === 10000)
    const hasAdvancedFilters = days.length > 0 || hasCustomPrice || timeSlot
    
    if (!hasAdvancedFilters) {
      setCoursesCount(baseCourseCount)
      return
    }

    // Если есть callback для подсчета - используем его
    if (onCountCourses) {
      const advancedFilters: AdvancedFilters = { days, price, timeSlot }
      const count = await onCountCourses(baseFilters, advancedFilters)
      setCoursesCount(count)
    } else {
      // Fallback - эстимация на основе базового count
      let count = baseCourseCount || 0
      if (count > 0) {
        if (days.length > 0) count = Math.floor(count * 0.7) // Фильтр по дням недели
        if (price[0] > 0 || price[1] < 10000) count = Math.floor(count * 0.8) // Ценовой фильтр
        if (timeSlot) count = Math.floor(count * 0.75) // Временной фильтр
        setCoursesCount(Math.max(1, count))
      } else {
        // Если нет базового count, показываем 0
        setCoursesCount(0)
      }
    }
  }, [baseFilters, baseCourseCount, onCountCourses])

  // Пересчитываем курсы при изменении временных фильтров с debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateCoursesCount(tempSelectedDays, tempPriceRange, tempSelectedTimeSlot)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [tempSelectedDays, tempPriceRange, tempSelectedTimeSlot, updateCoursesCount])

  // Инициализация при открытии диалога
  const handleDialogOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelectedDays(appliedFilters.days)
      setTempPriceRange(appliedFilters.price)
      setTempSelectedTimeSlot(appliedFilters.timeSlot)
      // Сразу пересчитываем количество для текущих фильтров
      updateCoursesCount(appliedFilters.days, appliedFilters.price, appliedFilters.timeSlot)
    }
    setOpen(isOpen)
  }

  const handleApplyFilters = () => {
    const newAdvancedFilters: AdvancedFilters = {
      days: tempSelectedDays,
      price: tempPriceRange,
      timeSlot: tempSelectedTimeSlot,
    }
    
    setAppliedFilters(newAdvancedFilters)
    
    // Уведомляем родительский компонент о применении фильтров
    onApplyAdvancedFilters?.(newAdvancedFilters)
    
    setOpen(false)
  }

  const handleResetFilters = () => {
    const resetFilters: AdvancedFilters = {
      days: [],
      price: [0, 10000],
      timeSlot: "",
    }
    
    setTempSelectedDays([])
    setTempPriceRange([0, 10000])
    setTempSelectedTimeSlot("")
    setAppliedFilters(resetFilters)
    
    // Применяем сброс фильтров и обновляем каталог курсов
    onApplyAdvancedFilters?.(resetFilters)
  }

  // UI кнопки должен показывать текущие временные изменения, а не только примененные
  const hasActiveFilters = tempSelectedDays.length > 0 || 
    !(tempPriceRange[0] === 0 && tempPriceRange[1] === 10000) ||
    tempSelectedTimeSlot

  return (
    <div>
      {/* Кнопка дополнительных фильтров */}
      <Dialog open={open} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className={variant === 'icon-only' ? "w-12 h-12 p-0" : "w-full justify-between"}
          >
            {variant === 'icon-only' ? (
              <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-blue-600' : ''}`} />
            ) : hasActiveFilters ? (
              <>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Дополнительно ({
                    [
                      tempSelectedDays.length > 0 && "дни",
                      !(tempPriceRange[0] === 0 && tempPriceRange[1] === 10000) && "цена",
                      tempSelectedTimeSlot && "время"
                    ].filter(Boolean).length
                  } активно)</span>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    handleResetFilters()
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleResetFilters()
                    }
                  }}
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span>Дополнительно</span>
                <Filter className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className={mobile 
          ? "w-screen h-screen max-w-none max-h-screen overflow-y-scroll m-0 p-0 rounded-none flex flex-col" 
          : "max-w-2xl max-h-[80vh] overflow-y-auto"
        }>
          <DialogHeader className={mobile ? "p-4 " : ""}>
            <DialogTitle>Дополнительные фильтры</DialogTitle>
            <DialogDescription className="sr-only">
              Выберите дополнительные параметры для фильтрации курсов: дни недели, ценовой диапазон и время занятий
            </DialogDescription>
          </DialogHeader>
          
          <div className={mobile ? "flex-1 p-4 space-y-4 overflow-y-auto" : "space-y-6"}>
            {/* Дни недели */}
            <WeekDaysSelector 
              selectedDays={tempSelectedDays}
              onDaysChange={setTempSelectedDays}
            />

            {/* Ценовой диапазон */}
            <PriceSliderWithHistogram 
              value={tempPriceRange}
              onValueChange={setTempPriceRange}
              minValue={0}
              maxValue={10000}
            />

            {/* Время занятий */}
            <TimeSlotsSelector 
              selectedTimeSlot={tempSelectedTimeSlot}
              onTimeSlotChange={setTempSelectedTimeSlot}
            />


          </div>

          <DialogFooter className={mobile ? "flex-shrink-0 p-4" : ""}>
            <div className={mobile ? "flex gap-3 w-full" : "flex gap-2"}>
              <Button variant="outline" className={mobile ? "flex-1" : ""} onClick={handleResetFilters}>
                Сбросить
              </Button>
              <Button className="flex-1" onClick={handleApplyFilters}>
                Показать {coursesCount} курсов
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}