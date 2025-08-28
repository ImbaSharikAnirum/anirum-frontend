"use client"

import { useId } from "react"
import { useSliderWithInput } from "@/hooks/use-slider-with-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

// Данные курсов для гистограммы (адаптировано под русские цены)
const coursesData = [
  { id: 1, price: 500 },
  { id: 2, price: 700 },
  { id: 3, price: 900 },
  { id: 4, price: 1000 },
  { id: 5, price: 1200 },
  { id: 6, price: 1400 },
  { id: 7, price: 1500 },
  { id: 8, price: 1600 },
  { id: 9, price: 1800 },
  { id: 10, price: 2000 },
  { id: 11, price: 2200 },
  { id: 12, price: 2400 },
  { id: 13, price: 2500 },
  { id: 14, price: 2600 },
  { id: 15, price: 2800 },
  { id: 16, price: 3000 },
  { id: 17, price: 3200 },
  { id: 18, price: 3400 },
  { id: 19, price: 3500 },
  { id: 20, price: 3600 },
  { id: 21, price: 3800 },
  { id: 22, price: 4000 },
  { id: 23, price: 4200 },
  { id: 24, price: 4500 },
  { id: 25, price: 4800 },
  { id: 26, price: 5000 },
  { id: 27, price: 5200 },
  { id: 28, price: 5500 },
  { id: 29, price: 5800 },
  { id: 30, price: 6000 },
  { id: 31, price: 6500 },
  { id: 32, price: 7000 },
  { id: 33, price: 7500 },
  { id: 34, price: 8000 },
  { id: 35, price: 8500 },
  { id: 36, price: 9000 },
  { id: 37, price: 9500 },
  { id: 38, price: 10000 },
]

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

  // Define the number of ticks
  const tick_count = 30

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

  // Calculate the price step based on the min and max prices
  const priceStep = (maxValue - minValue) / tick_count

  // Calculate course counts for each price range
  const courseCounts = Array(tick_count)
    .fill(0)
    .map((_, tick) => {
      const rangeMin = minValue + tick * priceStep
      const rangeMax = minValue + (tick + 1) * priceStep
      return coursesData.filter(
        (course) => course.price >= rangeMin && course.price < rangeMax
      ).length
    })

  // Find maximum count for scaling
  const maxCount = Math.max(...courseCounts)

  const handleSliderValueChange = (values: number[]) => {
    handleSliderChange(values)
    onValueChange(values)
  }

  // Function to count courses in the selected range
  const countCoursesInRange = (min: number, max: number) => {
    return coursesData.filter((course) => course.price >= min && course.price <= max).length
  }

  const isBarInSelectedRange = (
    index: number,
    minValue: number,
    priceStep: number,
    sliderValue: number[]
  ) => {
    const rangeMin = minValue + index * priceStep
    const rangeMax = minValue + (index + 1) * priceStep
    return (
      countCoursesInRange(sliderValue[0], sliderValue[1]) > 0 &&
      rangeMin <= sliderValue[1] &&
      rangeMax >= sliderValue[0]
    )
  }

  return (
    <div className="space-y-4">
      <Label>Цена за занятие</Label>
      <div>
        {/* Histogram bars */}
        <div className="flex h-12 w-full items-end px-3" aria-hidden="true">
          {courseCounts.map((count, i) => (
            <div
              key={i}
              className="flex flex-1 justify-center"
              style={{
                height: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
              }}
            >
              <span
                data-selected={isBarInSelectedRange(
                  i,
                  minValue,
                  priceStep,
                  sliderValue
                )}
                className="bg-primary/20 data-[selected=true]:bg-primary size-full"
              ></span>
            </div>
          ))}
        </div>
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