"use client"

import { Card } from "@/components/ui/card"
import { courseDirections, CourseDirection } from "@/features/courses-filters"

interface MobileDirectionSelectorProps {
  selectedDirection: CourseDirection | null
  tempSelectedDirection: CourseDirection | null
  expanded: boolean
  onDirectionSelect: (direction: CourseDirection) => void
  onToggleExpanded: () => void
}

export function MobileDirectionSelector({
  selectedDirection,
  tempSelectedDirection,
  expanded,
  onDirectionSelect,
  onToggleExpanded
}: MobileDirectionSelectorProps) {
  return (
    <Card className="p-4">
      {!expanded ? (
        <button 
          className="w-full text-left"
          onClick={onToggleExpanded}
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-medium">Направление</h3>
            <div className="text-sm text-gray-500 truncate max-w-[120px] text-right">
              {tempSelectedDirection ? tempSelectedDirection.name : "Выберите направление"}
            </div>
          </div>
        </button>
      ) : (
        <div>
          <h3 className="text-base font-medium mb-3">Направление</h3>
          <div className="grid grid-cols-2 gap-3">
            {courseDirections.map((direction) => (
              <button
                key={direction.id}
                onClick={() => onDirectionSelect(direction)}
                className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                  tempSelectedDirection?.id === direction.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img 
                  src={direction.image} 
                  alt={direction.name}
                  className="w-16 h-12 object-cover rounded mb-2"
                />
                <span className="text-sm font-medium text-center">{direction.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}