"use client"

import { useId } from "react"

interface NumberSelectorProps {
  selectedNumber: number | string
  onNumberChange: (number: number) => void
  min: number
  max: number
  label: string
}

export function NumberSelector({ selectedNumber, onNumberChange, min, max, label }: NumberSelectorProps) {
  const id = useId()
  
  const numbers = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  const handleNumberClick = (number: number) => {
    onNumberChange(number)
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        {label}
      </legend>
      <div className="flex gap-1.5 flex-wrap">
        {numbers.map((number) => (
          <button
            key={`${id}-${number}`}
            type="button"
            className={`
              relative flex size-9 cursor-pointer flex-col items-center justify-center gap-3 rounded-full border text-center shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring
              ${
                Number(selectedNumber) === number
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              }
            `}
            onClick={() => handleNumberClick(number)}
          >
            <span className="text-sm font-medium">
              {number}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}