"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface MobileAgeSelectorProps {
  age: string
  tempAge: string
  expanded: boolean
  onAgeChange: (age: string) => void
  onAgeApply: () => void
  onToggleExpanded: () => void
}

export function MobileAgeSelector({
  age,
  tempAge,
  expanded,
  onAgeChange,
  onAgeApply,
  onToggleExpanded
}: MobileAgeSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAgeApply()
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
            <h3 className="text-base font-medium">Возраст</h3>
            <span className="text-sm text-gray-500">
              {tempAge && parseInt(tempAge) > 0 ? `${tempAge} лет` : "Укажите возраст"}
            </span>
          </div>
        </button>
      ) : (
        <div>
          <h3 className="text-base font-medium mb-3">Возраст</h3>
          <div className="space-y-3">
            <Label htmlFor="age">Укажите ваш возраст</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="100"
              placeholder="Введите возраст"
              value={tempAge}
              onChange={(e) => onAgeChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              onClick={onAgeApply}
              disabled={!tempAge.trim() || parseInt(tempAge) <= 0}
              className="w-full"
            >
              Применить
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}