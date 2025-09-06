"use client"

import * as React from "react"
import {
  Calendar as AriaCalendar,
  CalendarGrid,
  CalendarCell,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Button,
  Heading,
} from "react-aria-components"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface CalendarProps {
  className?: string
}

export function Calendar({ className }: CalendarProps) {
  return (
    <AriaCalendar className={cn("p-3", className)}>
      <header className="flex w-full items-center justify-between pb-4">
        <Button
          slot="previous"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Heading className="text-sm font-medium" />
        <Button
          slot="next"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </header>
      <CalendarGrid className="w-full border-collapse select-none">
        <CalendarGridHeader>
          {(day) => (
            <CalendarHeaderCell className="text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] pb-2">
              {day}
            </CalendarHeaderCell>
          )}
        </CalendarGridHeader>
        <CalendarGridBody className="pt-1">
          {(date) => (
            <CalendarCell
              date={date}
              className={cn(
                "relative text-center text-sm",
                "h-8 w-8 p-0 font-normal",
                "flex items-center justify-center",
                "cursor-pointer rounded-md transition-colors",
                "focus:outline-none",
                // Обычное состояние
                "hover:bg-accent hover:text-accent-foreground",
                // Выбранное состояние (приоритет над hover/focus)
                "data-[selected]:bg-primary data-[selected]:text-primary-foreground",
                "data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground", 
                "data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground",
                "data-[selected]:focus-visible:bg-primary data-[selected]:focus-visible:text-primary-foreground",
                // Сегодня (только если не выбрано)
                "data-[today]:bg-accent data-[today]:text-accent-foreground",
                "data-[today][data-selected]:bg-primary data-[today][data-selected]:text-primary-foreground",
                // Неактивные дни
                "data-[outside-month]:text-muted-foreground data-[outside-month]:opacity-50",
                "data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through"
              )}
            >
              {({ formattedDate }) => (
                <span className="flex items-center justify-center w-full h-full">
                  {formattedDate}
                </span>
              )}
            </CalendarCell>
          )}
        </CalendarGridBody>
      </CalendarGrid>
    </AriaCalendar>
  )
}