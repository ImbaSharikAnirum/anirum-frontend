"use client"

import { useId } from "react"

interface Option {
  value: string
  label: string
  shortLabel?: string
}

interface OptionSelectorProps {
  selectedValue: string
  onValueChange: (value: string) => void
  options: Option[]
  label: string
}

export function OptionSelector({ selectedValue, onValueChange, options, label }: OptionSelectorProps) {
  const id = useId()

  const handleOptionClick = (optionValue: string) => {
    onValueChange(optionValue)
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        {label}
      </legend>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((option) => (
          <button
            key={`${id}-${option.value}`}
            type="button"
            className={`
              relative flex cursor-pointer items-center justify-center gap-3 rounded-full border text-center shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring px-4 py-2 min-w-[4rem]
              ${
                selectedValue === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              }
            `}
            onClick={() => handleOptionClick(option.value)}
          >
            <span className="text-sm font-medium">
              {option.shortLabel || option.label}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  )
}