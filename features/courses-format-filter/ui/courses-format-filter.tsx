"use client"

import { useState } from "react"
import { Monitor, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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

// Города для автодополнения (временные данные)
const cities = [
  "Москва, Россия",
  "Санкт-Петербург, Россия",
  "Екатеринбург, Россия",
  "Новосибирск, Россия",
  "Казань, Россия",
  "Нижний Новгород, Россия",
  "Челябинск, Россия",
  "Самара, Россия",
  "Ростов-на-Дону, Россия",
  "Уфа, Россия",
  "Красноярск, Россия",
  "Воронеж, Россия",
  "Пермь, Россия",
  "Волгоград, Россия",
  "Краснодар, Россия",
  "Саратов, Россия",
  "Тюмень, Россия",
  "Тольятти, Россия",
  "Ижевск, Россия",
  "Барнаул, Россия",
  "Алматы, Казахстан",
  "Минск, Беларусь",
  "Киев, Украина",
  "Ташкент, Узбекистан",
  "Баку, Азербайджан"
]

export function CoursesFormatFilter() {
  const [open, setOpen] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<typeof formats[0] | null>(null)
  const [locationQuery, setLocationQuery] = useState("")

  const filteredCities = cities
    .filter(city => city.toLowerCase().includes(locationQuery.toLowerCase()))
    .slice(0, 5)

  const handleFormatSelect = (format: typeof formats[0]) => {
    setSelectedFormat(format)
    if (format.id === "online") {
      setLocationQuery("")
      setOpen(false)
    }
  }

  const handleLocationSelect = (location: string) => {
    setLocationQuery(location)
    setOpen(false)
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
                    {selectedFormat.id === "offline" && locationQuery && (
                      <span className="text-xs text-gray-500">в {locationQuery}</span>
                    )}
                  </div>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFormat(null)
                    setLocationQuery("")
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedFormat(null)
                      setLocationQuery("")
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
                  className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
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
                <Label htmlFor="location">Город или страна</Label>
                <Input
                  id="location"
                  placeholder="Введите город или страну"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && locationQuery.trim()) {
                      handleLocationSelect(locationQuery.trim())
                    }
                  }}
                />
                
                {/* Список городов в поповере */}
                {locationQuery && filteredCities.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 font-medium">Популярные города:</div>
                    {filteredCities.map((city, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(city)}
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
        </PopoverContent>
      </Popover>

    </div>
  )
}