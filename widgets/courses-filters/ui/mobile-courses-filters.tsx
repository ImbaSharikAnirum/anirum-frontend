"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
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
import { useCoursesFilters } from "@/features/courses-filters"

// Маппинг направлений для отображения
const directionDisplayNames: Record<string, string> = {
  "sketching": "Скетчинг",
  "drawing2d": "2D рисование", 
  "modeling3d": "3D моделирование",
  "animation": "Анимация"
}

function getDirectionDisplayName(directionId: string): string {
  return directionDisplayNames[directionId] || directionId
}


interface MobileCoursesFiltersProps {
  filters: any
  coursesCount?: number
  setDirection: (direction: string | undefined) => void
  setFormatAndLocation: (format: 'online' | 'offline' | undefined, locationData?: import('@/features/courses-filters/ui').LocationData) => void
  setAge: (age: number | undefined) => void
  setTeacher: (teacherId: string | null) => void
  clearFilters: () => void
}

export function MobileCoursesFilters({
  filters,
  coursesCount,
  setDirection,
  setFormatAndLocation,
  setAge,
  setTeacher,
  clearFilters
}: MobileCoursesFiltersProps) {
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
    applyFilters: applyMobileFilters,
    resetFilters: resetMobileFilters,
  } = useMobileFilters()

  // Инициализация временных состояний при открытии диалога
  const handleDialogOpen = (open: boolean) => {
    if (open) {
      initializeTempStates()
      // Дополнительно синхронизируем с основными фильтрами
      // TODO: Можно добавить логику синхронизации основных фильтров с мобильными состояниями
    }
    setFiltersOpen(open)
  }

  const handleApplyFilters = () => {
    // Применяем фильтры из мобильного диалога к основной системе
    
    // Всегда обновляем направление (даже если null)
    setDirection(tempSelectedDirection || undefined)
    
    // Всегда обновляем формат и локацию
    if (tempSelectedFormat) {
      const locationData = tempLocationQuery ? { 
        city: tempLocationQuery, 
        country: '', 
        address: tempLocationQuery,
        googlePlaceId: '' 
      } : undefined
      setFormatAndLocation(tempSelectedFormat, locationData)
    } else {
      setFormatAndLocation(undefined, undefined)
    }
    
    // Всегда обновляем возраст
    if (tempAge && parseInt(tempAge) > 0) {
      setAge(parseInt(tempAge))
    } else {
      setAge(undefined)
    }
    
    // Всегда обновляем преподавателя  
    setTeacher(tempSelectedTeacher)
    
    // Применяем к локальным состояниям мобильного компонента
    applyMobileFilters()
    setFiltersOpen(false)
  }

  const handleResetFilters = () => {
    // Сбрасываем основные фильтры
    clearFilters()
    // Сбрасываем мобильные временные состояния
    resetMobileFilters()
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
                <span>{
                  filters.direction 
                    ? getDirectionDisplayName(filters.direction)
                    : selectedDirection 
                      ? getDirectionDisplayName(selectedDirection)
                      : "Чему обучиться?"
                }</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span>•</span>
                <span>
                  {filters.format ? (filters.format === 'online' ? 'Онлайн' : 'Оффлайн') : (selectedFormat === 'online' ? 'Онлайн' : selectedFormat === 'offline' ? 'Оффлайн' : "Формат")}
                </span>
                <span>•</span>
                <span>{filters.age ? `${filters.age} лет` : (age && parseInt(age) > 0 ? `${age} лет` : "Возраст")}</span>
              </div>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[100vw] h-[100vh] h-[100dvh] max-w-none p-0 rounded-none top-0 left-0 transform-none translate-x-0 translate-y-0 inset-0">
          <div className="flex flex-col h-full w-full min-w-0">
            {/* Шапка с safe-area */}
            <DialogHeader className="flex-shrink-0 pb-4 px-4 border-b bg-white w-full min-w-0" style={{paddingTop: 'max(env(safe-area-inset-top), 1rem)'}}>
              <div className="pt-2 w-full min-w-0">
                <DialogTitle className="text-lg font-semibold truncate">Фильтры курсов</DialogTitle>
                <DialogDescription className="sr-only">
                  Выберите параметры для фильтрации курсов: направление, формат обучения, возраст и преподавателя
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* Основное содержимое с правильным скроллом */}
            <div className="flex-1 overflow-y-scroll overflow-x-hidden w-full min-w-0" style={{height: 'calc(100vh - 160px)', maxHeight: 'calc(100dvh - 160px)'}}>
              <div className="px-4 py-6 pb-32 w-full min-w-0">
                <div className="space-y-6 w-full min-w-0">
                  {/* Направление */}
                  <MobileDirectionSelector
                    selectedDirection={filters.direction || null}
                    tempSelectedDirection={tempSelectedDirection}
                    expanded={directionExpanded}
                    onDirectionSelect={handleDirectionSelect}
                    onToggleExpanded={toggleDirectionExpanded}
                  />

                  {/* Формат */}
                  <MobileFormatSelector
                    selectedFormat={filters.format || null}
                    tempSelectedFormat={tempSelectedFormat}
                    locationQuery={filters.city || ""}
                    tempLocationQuery={tempLocationQuery}
                    expanded={formatExpanded}
                    onFormatSelect={handleFormatSelect}
                    onLocationChange={setTempLocationQuery}
                    onLocationSelect={handleLocationSelect}
                    onToggleExpanded={toggleFormatExpanded}
                  />

                  {/* Возраст */}
                  <MobileAgeSelector
                    age={filters.age ? filters.age.toString() : ""}
                    tempAge={tempAge}
                    expanded={ageExpanded}
                    onAgeChange={setTempAge}
                    onAgeApply={handleAgeApply}
                    onToggleExpanded={toggleAgeExpanded}
                  />

                  {/* Преподаватель */}
                  <MobileTeacherSelector
                    selectedTeacher={filters.teacherId || null}
                    tempSelectedTeacher={tempSelectedTeacher}
                    expanded={teacherExpanded}
                    onTeacherSelect={handleTeacherSelect}
                    onToggleExpanded={toggleTeacherExpanded}
                  />
                </div>
              </div>
            </div>

            {/* Футер с safe-area и тенью */}
            <DialogFooter className="flex-shrink-0 pt-4 px-4 border-t bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] w-full" style={{paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)'}}>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1 h-12 text-base font-medium" onClick={handleResetFilters}>
                  Сбросить
                </Button>
                <Button className="flex-1 h-12 text-base font-medium" onClick={handleApplyFilters}>
                  Показать курсы
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog> 

      {/* Дополнительные фильтры */}
      <AdvancedFilter 
        variant="icon-only" 
        mobile={true}
        baseFilters={filters}
        baseCourseCount={coursesCount}
      />
    </div>
  )
}