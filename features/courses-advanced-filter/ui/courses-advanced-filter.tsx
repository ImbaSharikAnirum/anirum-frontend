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
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { WeekDaysSelector } from "@/shared/ui/week-days-selector"
import { PriceSliderWithHistogram } from "@/shared/ui/price-slider-with-histogram"
import { TimeSlotsSelector } from "@/shared/ui/time-slots-selector"





export function CoursesAdvancedFilter() {
  const [open, setOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("")
  
  const [appliedFilters, setAppliedFilters] = useState({
    days: [] as string[],
    price: [0, 10000] as number[],
    timeSlot: "",
  })



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
      days: selectedDays,
      price: priceRange,
      timeSlot: selectedTimeSlot,
    })
    setOpen(false)
  }

  const handleResetFilters = () => {
    setSelectedDays([])
    setPriceRange([0, 10000])
    setSelectedTimeSlot("")
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            {hasActiveFilters ? (
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Дополнительные фильтры</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Дни недели */}
            <WeekDaysSelector 
              selectedDays={selectedDays}
              onDaysChange={setSelectedDays}
            />

            {/* Ценовой диапазон */}
            <PriceSliderWithHistogram 
              value={priceRange}
              onValueChange={setPriceRange}
              minValue={0}
              maxValue={10000}
            />

            {/* Время занятий */}
            <TimeSlotsSelector 
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotChange={setSelectedTimeSlot}
            />


          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleResetFilters}>
              Сбросить
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Показать {countCoursesWithFilters(selectedDays, priceRange, selectedTimeSlot)} курсов
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}