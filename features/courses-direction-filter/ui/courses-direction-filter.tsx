"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Направления с изображениями
const directions = [
  {
    id: "sketching",
    name: "Скетчинг",
    image: "https://cdnb.artstation.com/p/assets/images/images/091/248/689/large/liang-mark-oil-3.jpg?1756260267"
  },
  {
    id: "2d-drawing", 
    name: "2D рисование",
    image: "https://cdna.artstation.com/p/assets/images/images/091/245/334/large/horace-hsu-t1-final.jpg?1756246948"
  },
  {
    id: "3d-modeling",
    name: "3D моделирование", 
    image: "https://cdnb.artstation.com/p/assets/images/images/091/217/307/4k/wu-shenyou-2025-lin.jpg?1756177199"
  },
  {
    id: "animation",
    name: "Анимация",
    image: "https://cdnb.artstation.com/p/assets/images/images/091/201/023/large/baz-2.jpg?1756136309"
  }
]

export function CoursesDirectionFilter() {
  const [open, setOpen] = useState(false)
  const [selectedDirection, setSelectedDirection] = useState<typeof directions[0] | null>(null)

  const handleDirectionSelect = (direction: typeof directions[0]) => {
    setSelectedDirection(direction)
    setOpen(false)
  }

  return (
    <div>
      {/* Popover с кнопкой направлений */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            {selectedDirection ? (
              <>
                <div className="flex items-center gap-2">
                  <img 
                    src={selectedDirection.image} 
                    alt={selectedDirection.name}
                    className="w-5 h-4 object-cover rounded"
                  />
                  <span>{selectedDirection.name}</span>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedDirection(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedDirection(null)
                    }
                  }}
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span>Направление</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {directions.map((direction) => (
                <button
                  key={direction.id}
                  onClick={() => handleDirectionSelect(direction)}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  <img 
                    src={direction.image} 
                    alt={direction.name}
                    className="w-20 h-16 object-cover rounded mb-2"
                  />
                  <span className="text-sm font-medium text-center">{direction.name}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

    </div>
  )
}