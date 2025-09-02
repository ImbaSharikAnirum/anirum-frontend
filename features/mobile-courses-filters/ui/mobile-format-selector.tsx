"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { courseFormats, availableCities, CourseFormat } from "@/features/courses-filters"

interface MobileFormatSelectorProps {
  selectedFormat: CourseFormat | null
  tempSelectedFormat: CourseFormat | null
  locationQuery: string
  tempLocationQuery: string
  expanded: boolean
  onFormatSelect: (format: CourseFormat) => void
  onLocationChange: (location: string) => void
  onLocationSelect: (location: string) => void
  onToggleExpanded: () => void
}

export function MobileFormatSelector({
  selectedFormat,
  tempSelectedFormat,
  locationQuery,
  tempLocationQuery,
  expanded,
  onFormatSelect,
  onLocationChange,
  onLocationSelect,
  onToggleExpanded
}: MobileFormatSelectorProps) {
  const filteredCities = availableCities
    .filter(city => city.toLowerCase().includes(tempLocationQuery.toLowerCase()))
    .slice(0, 5)

  return (
    <Card className="p-4">
      {!expanded ? (
        <button 
          className="w-full text-left"
          onClick={onToggleExpanded}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">Формат</h3>
            <span className="text-sm text-gray-500">
              {tempSelectedFormat 
                ? tempSelectedFormat.id === "offline" && tempLocationQuery 
                  ? tempLocationQuery.split(',')[0]
                  : tempSelectedFormat.name
                : "Онлайн или оффлайн"}
            </span>
          </div>
        </button>
      ) : (
        <div>
          <h3 className="text-base font-medium mb-3">Формат обучения</h3>
          <div className="flex gap-2 mb-4">
            {courseFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => onFormatSelect(format)}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-colors border ${
                  tempSelectedFormat?.id === format.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <format.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="font-medium text-sm">{format.name}</div>
                  <div className="text-xs text-gray-600">{format.description}</div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Поле ввода локации для оффлайн */}
          {tempSelectedFormat?.id === "offline" && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="location">Город или страна</Label>
              <Input
                id="location"
                placeholder="Введите город или страну"
                value={tempLocationQuery}
                onChange={(e) => onLocationChange(e.target.value)}
              />
              
              {/* Список городов */}
              {tempLocationQuery && filteredCities.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 font-medium">Популярные города:</div>
                  {filteredCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => onLocationSelect(city)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}