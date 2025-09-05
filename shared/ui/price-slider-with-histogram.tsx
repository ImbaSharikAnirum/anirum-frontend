"use client"

import { useId } from "react"
import { useSliderWithInput } from "@/hooks/use-slider-with-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface PriceSliderWithHistogramProps {
  value: number[]
  onValueChange: (value: number[]) => void
  minValue?: number
  maxValue?: number
}

export function PriceSliderWithHistogram({
  value,
  onValueChange,
  minValue = 0,
  maxValue = 10000
}: PriceSliderWithHistogramProps) {
  const id = useId()

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({ 
    minValue, 
    maxValue, 
    initialValue: value 
  })

  const handleSliderValueChange = (values: number[]) => {
    handleSliderChange(values)
    onValueChange(values)
  }

  return (
    <div className="space-y-4">
      <Label>Цена за занятие</Label>
      <div>
        <Slider
          value={sliderValue}
          onValueChange={handleSliderValueChange}
          min={minValue}
          max={maxValue}
          step={100}
          aria-label="Price range"
        />
      </div>

      {/* Inputs */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor={`${id}-min`}>Минимум</Label>
          <div className="relative">
            <Input
              id={`${id}-min`}
              className="peer w-full pr-6"
              type="text"
              inputMode="decimal"
              value={inputValues[0]}
              onChange={(e) => handleInputChange(e, 0)}
              onBlur={() => validateAndUpdateValue(inputValues[0], 0)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  validateAndUpdateValue(inputValues[0], 0)
                }
              }}
              aria-label="Введите минимальную цену"
            />
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pr-3 text-sm peer-disabled:opacity-50">
              ₽
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${id}-max`}>Максимум</Label>
          <div className="relative">
            <Input
              id={`${id}-max`}
              className="peer w-full pr-6"
              type="text"
              inputMode="decimal"
              value={inputValues[1]}
              onChange={(e) => handleInputChange(e, 1)}
              onBlur={() => validateAndUpdateValue(inputValues[1], 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  validateAndUpdateValue(inputValues[1], 1)
                }
              }}
              aria-label="Введите максимальную цену"
            />
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pr-3 text-sm peer-disabled:opacity-50">
              ₽
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}