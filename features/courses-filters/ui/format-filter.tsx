"use client"

import { useState, useEffect } from "react"
import { Monitor, MapPin, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useGooglePlaces } from "@/shared/hooks/use-google-places"

interface FormatFilterProps {
  value?: 'online' | 'offline'
  cityValue?: string
  onFormatAndLocationChange?: (format: 'online' | 'offline' | undefined, city?: string) => void
}

// Форматы курсов
const formats = [
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
]


export function FormatFilter({ value, cityValue, onFormatAndLocationChange }: FormatFilterProps) {
  const [open, setOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState("")
  const [shortLocationName, setShortLocationName] = useState("") 
  const { predictions, isLoading, error, searchPlaces, clearPredictions, getPlaceDetails } = useGooglePlaces()

  const selectedFormat = value ? formats.find(f => f.id === value) || null : null

  // Функция для извлечения короткого названия (город)
  const getShortLocationName = (fullAddress: string) => {
    // Пытаемся извлечь город из адреса
    const parts = fullAddress.split(',').map(part => part.trim())
    // Обычно город во втором элементе: "улица, город, страна"
    if (parts.length >= 2) {
      return parts[1] // Возвращаем город
    }
    // Если не можем разобрать, возвращаем первые 2 части
    return parts.slice(0, 2).join(', ')
  }

  // Синхронизация с cityValue для отображения
  useEffect(() => {
    if (cityValue && value === 'offline' && !shortLocationName) {
      setShortLocationName(cityValue)
      setLocationQuery(cityValue)
    }
  }, [cityValue, value, shortLocationName])

  // Дебаунс для поиска мест
  useEffect(() => {
    if (!locationQuery.trim()) {
      clearPredictions()
      return
    }

    const timeoutId = setTimeout(() => {
      searchPlaces(locationQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [locationQuery, searchPlaces, clearPredictions])

  const handleFormatSelect = (format: typeof formats[0]) => {
    const newFormat = format.id as 'online' | 'offline'
    
    console.log('🎯 handleFormatSelect called:', { 
      formatId: format.id, 
      newFormat, 
      cityValue,
      locationQuery,
      shortLocationName 
    })
    
    if (newFormat === "online") {
      setLocationQuery("")
      setShortLocationName("")
      clearPredictions()
      setOpen(false)
      console.log('📡 Calling onFormatAndLocationChange with online:', newFormat, undefined)
      onFormatAndLocationChange?.(newFormat, undefined)
    } else {
      console.log('🏢 Calling onFormatAndLocationChange with offline:', newFormat, cityValue)
      onFormatAndLocationChange?.(newFormat, cityValue)
    }
  }

  const handleLocationSelect = async (prediction: any) => {
    const russianDescription = prediction.description
    
    console.log('📍 handleLocationSelect called:', { 
      prediction, 
      russianDescription,
      place_id: prediction.place_id 
    })
    
    setLocationQuery(russianDescription)
    clearPredictions()
    setOpen(false)

    // Получаем детальную информацию о месте
    if (prediction.place_id) {
      const details = await getPlaceDetails(prediction.place_id, russianDescription)
      console.log('📍 Place details received:', details)
      
      if (details) {
        const shortName = details.displayCity || details.city || getShortLocationName(russianDescription)
        setShortLocationName(shortName)
        
        console.log('📍 Setting location data:', { 
          shortLocationName: shortName,
          city: details.city,
          format: 'offline'
        })
        
        // Передаем город для фильтрации
        console.log('📍 Calling onFormatAndLocationChange with city:', 'offline', details.city)
        onFormatAndLocationChange?.('offline', details.city)
      }
    }
  }

  return (
    <div>
      {/* Popover с кнопкой форматов */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            {selectedFormat ? (
              <>
                <div className="flex items-center gap-2">
                  <selectedFormat.icon className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span>{selectedFormat.name}</span>
                    {selectedFormat.id === "offline" && shortLocationName && (
                      <span className="text-xs text-gray-500">в {shortLocationName}</span>
                    )}
                  </div>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setLocationQuery("")
                    setShortLocationName("")
                    onFormatAndLocationChange?.(undefined, undefined)
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setLocationQuery("")
                      setShortLocationName("")
                      onFormatAndLocationChange?.(undefined, undefined)
                    }
                  }}
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span>Формат</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleFormatSelect(format)}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg transition-colors border ${
                    selectedFormat?.id === format.id
                      ? 'bg-gray-100 border-gray-300' // Серый фон для выбранного
                      : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
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
            {selectedFormat?.id === "offline" && (
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="location">Город или адрес</Label>
                <div className="relative">
                  <Input
                    id="location"
                    placeholder="Введите город или точный адрес"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && locationQuery.trim()) {
                        handleLocationSelect(locationQuery.trim())
                      }
                    }}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Ошибка загрузки */}
                {error && (
                  <div className="text-xs text-red-500">{error}</div>
                )}
                
                {/* Список адресов от Google Places */}
                {locationQuery && predictions.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Города и адреса:</div>
                    {predictions.map((prediction) => (
                      <button
                        key={prediction.place_id}
                        onClick={() => handleLocationSelect(prediction)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                      >
                        <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                        <div className="text-xs text-gray-500">{prediction.structured_formatting.secondary_text}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

    </div>
  )
}