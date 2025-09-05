"use client"

import { useId } from "react"
import { AtSignIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TelegramUsernameInputProps {
  value?: string
  onValueChange?: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TelegramUsernameInput({
  value = "",
  onValueChange,
  placeholder = "username",
  disabled = false,
  className,
  ...props
}: TelegramUsernameInputProps) {
  const id = useId()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onValueChange?.(inputValue)
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        onChange={handleChange}
        className="peer ps-9"
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
      <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
        <AtSignIcon size={16} aria-hidden="true" />
      </div>
    </div>
  )
}