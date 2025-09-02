"use client"

import { useState } from "react"
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




interface AdvancedFilterProps {
  variant?: 'default' | 'icon-only'
  mobile?: boolean
}

export function AdvancedFilter({ variant = 'default', mobile = false }: AdvancedFilterProps = {}) {
  const [open, setOpen] = useState(false)
  
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



  // Инициализация временных состояний при открытии диалога
  const handleDialogOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelectedDays(appliedFilters.days)
      setTempPriceRange(appliedFilters.price)
      setTempSelectedTimeSlot(appliedFilters.timeSlot)
    }
    setOpen(isOpen)
  }

  // Функция подсчета курсов с учетом всех фильтров
  const countCoursesWithFilters = (days: string[], price: number[], timeSlot: string) => {
    // Здесь будет логика подсчета курсов с учетом всех фильтров
    // Пока используем мок-данные
    let count = 147 // базовое количество курсов
    
    if (days.length > 0) count = Math.floor(count * 0.7) // уменьшаем на 30% за дни
    if (price[0] > 0 || price[1] < 10000) count = Math.floor(count * 0.8) // уменьшаем на 20% за цену
    if (timeSlot) count = Math.floor(count * 0.75) // уменьшаем на 25% за время
    
    return Math.max(1, count) // минимум 1 курс
  }

  const handleApplyFilters = () => {
    setAppliedFilters({
      days: tempSelectedDays,
      price: tempPriceRange,
      timeSlot: tempSelectedTimeSlot,
    })
    setOpen(false)
  }

  const handleResetFilters = () => {
    setTempSelectedDays([])
    setTempPriceRange([0, 10000])
    setTempSelectedTimeSlot("")
    setAppliedFilters({
      days: [],
      price: [0, 10000],
      timeSlot: "",
    })
  }

  const hasActiveFilters = appliedFilters.days.length > 0 || 
    appliedFilters.price[0] > 0 || appliedFilters.price[1] < 10000 ||
    appliedFilters.timeSlot

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
                      appliedFilters.days.length > 0 && appliedFilters.days.length,
                      (appliedFilters.price[0] > 0 || appliedFilters.price[1] < 10000) && "цена",
                      appliedFilters.timeSlot && "время"
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
                Показать {countCoursesWithFilters(tempSelectedDays, tempPriceRange, tempSelectedTimeSlot)} курсов
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}