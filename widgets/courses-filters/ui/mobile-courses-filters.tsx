"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
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
import { AdvancedFilter } from "@/features/courses-filters/ui/advanced-filter"
import {
  MobileDirectionSelector,
  MobileFormatSelector,
  MobileAgeSelector,
  MobileTeacherSelector,
  useMobileFilters
} from "@/features/mobile-courses-filters"


export function MobileCoursesFilters() {
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  const {
    selectedDirection,
    selectedFormat,
    age,
    tempSelectedDirection,
    tempSelectedFormat,
    tempLocationQuery,
    tempAge,
    tempSelectedTeacher,
    directionExpanded,
    formatExpanded,
    ageExpanded,
    teacherExpanded,
    setTempLocationQuery,
    setTempAge,
    initializeTempStates,
    handleDirectionSelect,
    toggleDirectionExpanded,
    handleFormatSelect,
    handleLocationSelect,
    toggleFormatExpanded,
    handleAgeApply,
    toggleAgeExpanded,
    handleTeacherSelect,
    toggleTeacherExpanded,
    applyFilters,
    resetFilters,
  } = useMobileFilters()

  // Инициализация временных состояний при открытии диалога
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      initializeTempStates()
    }
    setFiltersOpen(open)
  }

  const handleApplyFilters = () => {
    applyFilters()
    setFiltersOpen(false)
  }

  return (
    <div className="md:hidden flex gap-2">
      {/* Основные фильтры */}
      <Dialog open={filtersOpen} onOpenChange={handleDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex-1 h-12">
            <Filter className="h-4 w-4 mr-2" />
            <div className="flex flex-col items-start text-sm">
              <div className="flex items-center gap-1">
                <span>{selectedDirection ? selectedDirection.name : "Чему обучиться?"}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>•</span>
                <span>
                  {selectedFormat ? selectedFormat.name : "Формат"}
                </span>
                <span>•</span>
                <span>{age && parseInt(age) > 0 ? `${age} лет` : "Возраст"}</span>
              </div>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-screen h-screen max-w-none max-h-screen overflow-y-scroll m-0 p-0 rounded-none">
          <div className="flex flex-col h-full">
            {/* Шапка */}
            <DialogHeader className="flex-shrink-0 p-4 border-b">
              <DialogTitle className="text-lg font-semibold">Фильтры курсов</DialogTitle>
              <DialogDescription className="sr-only">
                Выберите параметры для фильтрации курсов: направление, формат обучения, возраст и преподавателя
              </DialogDescription>
            </DialogHeader>

            {/* Основное содержимое */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {/* Направление */}
                <MobileDirectionSelector
                  selectedDirection={selectedDirection}
                  tempSelectedDirection={tempSelectedDirection}
                  expanded={directionExpanded}
                  onDirectionSelect={handleDirectionSelect}
                  onToggleExpanded={toggleDirectionExpanded}
                />

                {/* Формат */}
                <MobileFormatSelector
                  selectedFormat={selectedFormat}
                  tempSelectedFormat={tempSelectedFormat}
                  locationQuery={""}
                  tempLocationQuery={tempLocationQuery}
                  expanded={formatExpanded}
                  onFormatSelect={handleFormatSelect}
                  onLocationChange={setTempLocationQuery}
                  onLocationSelect={handleLocationSelect}
                  onToggleExpanded={toggleFormatExpanded}
                />

                {/* Возраст */}
                <MobileAgeSelector
                  age={age}
                  tempAge={tempAge}
                  expanded={ageExpanded}
                  onAgeChange={setTempAge}
                  onAgeApply={handleAgeApply}
                  onToggleExpanded={toggleAgeExpanded}
                />

                {/* Преподаватель */}
                <MobileTeacherSelector
                  selectedTeacher={""}
                  tempSelectedTeacher={tempSelectedTeacher}
                  expanded={teacherExpanded}
                  onTeacherSelect={handleTeacherSelect}
                  onToggleExpanded={toggleTeacherExpanded}
                />

                
              </div>
            </div>

            {/* Футер */}
            <DialogFooter className="flex-shrink-0 p-4 border-t">
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>
                  Сбросить
                </Button>
                <Button className="flex-1" onClick={handleApplyFilters}>
                  Показать курсы
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog> 

      {/* Дополнительные фильтры */}
      <AdvancedFilter variant="icon-only" mobile={true} />
    </div>
  )
}