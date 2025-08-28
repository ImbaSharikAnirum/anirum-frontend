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

export function CoursesAgeFilter() {
  const [open, setOpen] = useState(false)
  const [age, setAge] = useState("")

  const handleAgeApply = () => {
    if (age.trim() && parseInt(age) > 0) {
      setOpen(false)
    }
  }

  const handleAgeReset = () => {
    setAge("")
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
            {age && parseInt(age) > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{age} лет</span>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setAge("")
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-2 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      setAge("")
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
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAgeApply()
                  }
                }}
              />
              <Button
                onClick={handleAgeApply}
                disabled={!age.trim() || parseInt(age) <= 0}
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