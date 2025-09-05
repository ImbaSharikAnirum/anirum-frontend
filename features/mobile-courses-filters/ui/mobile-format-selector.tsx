"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Monitor, MapPin } from "lucide-react"
import { useGooglePlaces } from "@/shared/hooks/use-google-places"
import { useEffect } from "react"

// Форматы курсов
const courseFormats = [
  {
    id: "online",
    name: "Онлайн",
    description: "Изучайте из любой точки мира",
    icon: Monitor
  },
  {
    id: "offline", 
    name: "Оффлайн", 
    description: "Очные занятия в учебном центре",
    icon: MapPin
  }
] as const

interface MobileFormatSelectorProps {
  selectedFormat: 'online' | 'offline' | null
  tempSelectedFormat: 'online' | 'offline' | null
  locationQuery: string
  tempLocationQuery: string
  expanded: boolean
  onFormatSelect: (format: 'online' | 'offline') => void
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
  const { predictions, isLoading, error, searchPlaces, clearPredictions, getPlaceDetails } = useGooglePlaces()

  // Debounce поиск по Google Places
  useEffect(() => {
    if (!tempLocationQuery || tempLocationQuery.length < 2) {
      clearPredictions()
      return
    }

    const timeoutId = setTimeout(() => {
      searchPlaces(tempLocationQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [tempLocationQuery, searchPlaces, clearPredictions])

  const handleGoogleLocationSelect = async (prediction: any) => {
    const russianDescription = prediction.description
    onLocationChange(russianDescription)
    clearPredictions()
    
    // Получаем детальную информацию о месте
    if (prediction.place_id) {
      const details = await getPlaceDetails(prediction.place_id, russianDescription)
      if (details) {
        // Передаем город для фильтрации
        onLocationSelect(details.city || russianDescription)
      } else {
        onLocationSelect(russianDescription)
      }
    }
  }

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
                ? tempSelectedFormat === "offline" && tempLocationQuery 
                  ? tempLocationQuery.split(',')[0]
                  : tempSelectedFormat === "online" ? "Онлайн" : "Оффлайн"
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
                onClick={() => onFormatSelect(format.id as 'online' | 'offline')}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-colors border ${
                  tempSelectedFormat === format.id
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
          {tempSelectedFormat === "offline" && (
            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="location">Город или страна</Label>
              <Input
                id="location"
                placeholder="Введите город или страну"
                value={tempLocationQuery}
                onChange={(e) => onLocationChange(e.target.value)}
              />
              
              {/* Список предложений Google Places */}
              {tempLocationQuery && predictions.length > 0 && (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  <div className="text-xs text-gray-500 font-medium">Выберите местоположение:</div>
                  {predictions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      onClick={() => handleGoogleLocationSelect(prediction)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      {prediction.description}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Состояние загрузки */}
              {isLoading && tempLocationQuery && (
                <div className="text-xs text-gray-500 px-3 py-2">
                  Поиск локаций...
                </div>
              )}
              
              {/* Ошибка загрузки */}
              {error && tempLocationQuery && (
                <div className="text-xs text-red-500 px-3 py-2">
                  Ошибка поиска: {error}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}