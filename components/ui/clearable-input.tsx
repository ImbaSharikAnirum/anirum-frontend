"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClearableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string
  onValueChange?: (value: string) => void
  onClear?: () => void
}

const ClearableInput = React.forwardRef<HTMLInputElement, ClearableInputProps>(
  ({ className, value, onValueChange, onClear, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "")

    React.useEffect(() => {
      setInternalValue(value || "")
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInternalValue(newValue)
      onValueChange?.(newValue)
    }

    const handleClear = () => {
      setInternalValue("")
      onValueChange?.("")
      onClear?.()
    }

    return (
      <div className="relative group">
        <input
          ref={ref}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            internalValue && "pr-8",
            className
          )}
          value={internalValue}
          onChange={handleChange}
          {...props}
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "flex h-4 w-4 items-center justify-center rounded-sm",
              "text-muted-foreground hover:text-foreground",
              "transition-all hover:bg-accent",
              "opacity-70 group-hover:opacity-100"
            )}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Clear</span>
          </button>
        )}
      </div>
    )
  }
)

ClearableInput.displayName = "ClearableInput"

export { ClearableInput }