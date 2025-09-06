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
import { PhoneNumberInput } from "@/components/ui/phone-number-input"
import { TelegramUsernameInput } from "@/components/ui/telegram-username-input"
import { cn } from "@/lib/utils"
import { MessageCircle, Send } from "lucide-react"

interface MessengerInputProps {
  value?: string
  onValueChange?: (value: string | undefined) => void
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
    icon: <MessageCircle className="h-4 w-4" />
  },
  {
    value: 'telegram', 
    label: 'Telegram',
    icon: <Send className="h-4 w-4" />
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
      return telegramMode === 'phone' ? "+7 9123456789" : "username"
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
      {(messenger === 'whatsapp' || (messenger === 'telegram' && telegramMode === 'phone')) ? (
        <PhoneNumberInput
          value={value}
          onValueChange={onValueChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
        />
      ) : messenger === 'telegram' && telegramMode === 'username' ? (
        <TelegramUsernameInput
          value={value}
          onValueChange={onValueChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={disabled}
          {...props}
        />
      )}
    </div>
  )
}
