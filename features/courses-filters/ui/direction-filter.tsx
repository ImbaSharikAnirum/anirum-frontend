"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { courseDirections, CourseDirection } from "../model/filter-data"

interface DirectionFilterProps {
  defaultValue?: string
  onDirectionChange?: (direction: string) => void
}

export function DirectionFilter({ defaultValue, onDirectionChange }: DirectionFilterProps) {
  const [open, setOpen] = useState(false)
  const [selectedDirection, setSelectedDirection] = useState<CourseDirection | null>(() => {
    if (defaultValue) {
      return courseDirections.find(d => d.id === defaultValue) || null
    }
    return null
  })

  const handleDirectionSelect = (direction: CourseDirection) => {
    setSelectedDirection(direction)
    setOpen(false)
    onDirectionChange?.(direction.id)
  }

  const handleClearDirection = () => {
    setSelectedDirection(null)
    onDirectionChange?.('')
  }

  return (
    <div>
      {/* Popover с кнопкой направлений */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between pr-2"
          >
            {selectedDirection ? (
              <>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img 
                    src={selectedDirection.image} 
                    alt={selectedDirection.name}
                    className="w-5 h-4 object-cover rounded flex-shrink-0"
                  />
                  <span className="truncate">{selectedDirection.name}</span>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearDirection()
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer flex-shrink-0 w-4 h-4 flex items-center justify-center"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleClearDirection()
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
              {courseDirections.map((direction) => (
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