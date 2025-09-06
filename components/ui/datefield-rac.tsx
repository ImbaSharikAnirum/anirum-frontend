"use client"

import * as React from "react"
import {
  DateInput as AriaDateInput,
  DateSegment,
} from "react-aria-components"

import { cn } from "@/lib/utils"

interface DateInputProps {
  className?: string
}

export function DateInput({ className }: DateInputProps) {
  return (
    <AriaDateInput
      className={cn(
        "flex h-10 w-auto min-w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      {(segment) => (
        <DateSegment
          segment={segment}
          className={cn(
            "inline rounded p-0.5 text-foreground caret-transparent outline-none data-[focused]:bg-accent data-[invalid]:text-destructive data-[type=literal]:text-muted-foreground",
            "focus:bg-accent focus:text-accent-foreground",
            "data-[placeholder]:text-muted-foreground"
          )}
        />
      )}
    </AriaDateInput>
  )
}