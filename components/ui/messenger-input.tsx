"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface MessengerInputProps {
  value?: string
  onValueChange?: (value: string) => void
  messenger?: 'whatsapp' | 'telegram'
  onMessengerChange?: (messenger: 'whatsapp' | 'telegram') => void
  telegramMode?: 'phone' | 'username'
  onTelegramModeChange?: (mode: 'phone' | 'username') => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

const messengers = [
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: '📱'
  },
  {
    value: 'telegram', 
    label: 'Telegram',
    icon: '✈️'
  }
]

export function MessengerInput({
  className,
  value = "",
  onValueChange,
  messenger = 'whatsapp',
  onMessengerChange,
  telegramMode = 'phone',
  onTelegramModeChange,
  placeholder,
  disabled = false,
  ...props
}: MessengerInputProps) {
  const selectedMessenger = messengers.find(m => m.value === messenger)

  const getPlaceholder = () => {
    if (placeholder) return placeholder
    
    if (messenger === 'whatsapp') {
      return "+7 9123456789"
    } else if (messenger === 'telegram') {
      return telegramMode === 'phone' ? "+7 9123456789" : "@username"
    }
    return "Введите контакт"
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Выбор мессенджера */}
      <Select 
        value={messenger} 
        onValueChange={(value) => onMessengerChange?.(value as 'whatsapp' | 'telegram')}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{selectedMessenger?.icon}</span>
              <span>{selectedMessenger?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {messengers.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Если Telegram - выбор между телефоном и username */}
      {messenger === 'telegram' && (
        <Select 
          value={telegramMode} 
          onValueChange={(value) => onTelegramModeChange?.(value as 'phone' | 'username')}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue>
              {telegramMode === 'phone' ? 'Номер телефона' : 'Имя пользователя'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="phone">Номер телефона</SelectItem>
            <SelectItem value="username">Имя пользователя (@username)</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Поле ввода */}
      <Input
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        placeholder={getPlaceholder()}
        disabled={disabled}
        {...props}
      />
    </div>
  )
}
