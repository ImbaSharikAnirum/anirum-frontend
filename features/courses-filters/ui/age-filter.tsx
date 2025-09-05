"use client"

import { useState } from "react"
import { ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AgeFilterProps {
  value?: number
  onAgeChange?: (age: number | undefined) => void
}

export function AgeFilter({ value, onAgeChange }: AgeFilterProps) {
  const [open, setOpen] = useState(false)
  const [localAge, setLocalAge] = useState("")

  const handleAgeApply = () => {
    if (localAge.trim() && parseInt(localAge) > 0) {
      onAgeChange?.(parseInt(localAge))
      setOpen(false)
    }
  }

  const handleAgeReset = () => {
    setLocalAge("")
    onAgeChange?.(undefined)
  }

  return (
    <div>
      {/* Popover с кнопкой возраста */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            {value && value > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{value} лет</span>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAgeReset()
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleAgeReset()
                    }
                  }}
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span>Возраст</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4">
            <div className="space-y-3">
              <Label htmlFor="age">Укажите ваш возраст</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="100"
                placeholder="Введите возраст"
                value={localAge}
                onChange={(e) => setLocalAge(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAgeApply()
                  }
                }}
              />
              <Button
                onClick={handleAgeApply}
                disabled={!localAge.trim() || parseInt(localAge) <= 0}
                className="w-full"
              >
                Применить
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

    </div>
  )
}