"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { courseAPI } from "@/entities/course"
import { Course } from "@/entities/course/model/types"

// Статичные данные для отображения (изображения и красивые названия)
const directionData = [
  {
    id: "sketching",
    name: "Скетчинг",
    image: "/directions/scetching.jpg"
  },
  {
    id: "drawing2d", 
    name: "2D рисование",
    image: "/directions/2D.png"
  },
  {
    id: "modeling3d",
    name: "3D моделирование", 
    image: "/directions/3D.png"
  },
  {
    id: "animation",
    name: "Анимация",
    image: "/directions/animation.jpg"
  },
]

interface MobileDirectionSelectorProps {
  selectedDirection: string | null
  tempSelectedDirection: string | null
  expanded: boolean
  onDirectionSelect: (direction: string) => void
  onToggleExpanded: () => void
}

export function MobileDirectionSelector({
  selectedDirection,
  tempSelectedDirection,
  expanded,
  onDirectionSelect,
  onToggleExpanded
}: MobileDirectionSelectorProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true)
        const result = await courseAPI.getCourses({
          page: 1,
          pageSize: 100,
        })
        setCourses(result.courses)
      } catch (error) {
        console.error('Error loading courses:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadCourses()
  }, [])
  
  // Показываем все направления из статичных данных
  const availableDirections = directionData

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">Загрузка направлений...</div>
      </Card>
    )
  }

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
              {tempSelectedDirection 
                ? directionData.find(d => d.id === tempSelectedDirection)?.name || tempSelectedDirection
                : "Выберите направление"}
            </div>
          </div>
        </button>
      ) : (
        <div>
          <h3 className="text-base font-medium mb-3">Направление</h3>
          <div className="grid grid-cols-2 gap-3">
            {availableDirections.map((direction) => (
              <button
                key={direction.id}
                onClick={() => onDirectionSelect(direction.id)}
                className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                  tempSelectedDirection === direction.id 
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