'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessengerInput } from '@/components/ui/messenger-input'

interface ContactStepProps {
  onNext: () => void
  onDataChange: (data: ContactData) => void
  initialData?: ContactData
}

export interface ContactData {
  firstName: string
  lastName: string
  whatsappPhone: string
  telegramPhone: string
  telegramUsername: string
  messenger: 'whatsapp' | 'telegram'
  telegramMode: 'phone' | 'username'
}

export function ContactStep({ onNext, onDataChange, initialData }: ContactStepProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || '')
  const [lastName, setLastName] = useState(initialData?.lastName || '')
  const [messenger, setMessenger] = useState<'whatsapp' | 'telegram'>(initialData?.messenger || 'whatsapp')
  const [whatsappPhone, setWhatsappPhone] = useState(initialData?.whatsappPhone || '')
  const [telegramPhone, setTelegramPhone] = useState(initialData?.telegramPhone || '')
  const [telegramUsername, setTelegramUsername] = useState(initialData?.telegramUsername || '')
  const [telegramMode, setTelegramMode] = useState<'phone' | 'username'>(initialData?.telegramMode || 'phone')

  // Функция для получения текущего значения контакта
  const getCurrentContactValue = () => {
    if (messenger === 'whatsapp') {
      return whatsappPhone
    } else if (messenger === 'telegram') {
      return telegramMode === 'phone' ? telegramPhone : telegramUsername
    }
    return ''
  }

  // Функция для установки значения контакта
  const setCurrentContactValue = (value: string | undefined) => {
    const safeValue = value || ''
    
    if (messenger === 'whatsapp') {
      setWhatsappPhone(safeValue)
      onDataChange({
        firstName,
        lastName,
        whatsappPhone: safeValue,
        telegramPhone,
        telegramUsername,
        messenger,
        telegramMode
      })
    } else if (messenger === 'telegram') {
      if (telegramMode === 'phone') {
        setTelegramPhone(safeValue)
        onDataChange({
          firstName,
          lastName,
          whatsappPhone,
          telegramPhone: safeValue,
          telegramUsername,
          messenger,
          telegramMode
        })
      } else {
        setTelegramUsername(safeValue)
        onDataChange({
          firstName,
          lastName,
          whatsappPhone,
          telegramPhone,
          telegramUsername: safeValue,
          messenger,
          telegramMode
        })
      }
    }
  }

  const handleInputChange = (field: keyof ContactData, value: any) => {
    const newData = {
      firstName,
      lastName,
      whatsappPhone,
      telegramPhone,
      telegramUsername,
      messenger,
      telegramMode,
      [field]: value
    }

    switch (field) {
      case 'firstName':
        setFirstName(value)
        break
      case 'lastName':
        setLastName(value)
        break
      case 'messenger':
        setMessenger(value)
        break
      case 'telegramMode':
        setTelegramMode(value)
        break
    }

    onDataChange(newData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-2">Укажите ваши данные</h3>
      <p className="text-sm text-gray-600 mb-4">
        На этом этапе записываете данные того, кто записывается. 
        Данные ученика заполните на следующем этапе.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Имя и фамилия */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Введите имя"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Введите фамилию"
              required
            />
          </div>
        </div>

        {/* Мессенджер для связи */}
        <div className="space-y-2">
          <Label>Мессенджер для связи</Label>
          <MessengerInput
            messenger={messenger}
            onMessengerChange={(value) => handleInputChange('messenger', value)}
            telegramMode={telegramMode}
            onTelegramModeChange={(value) => handleInputChange('telegramMode', value)}
            value={getCurrentContactValue()}
            onValueChange={setCurrentContactValue}
          />
        </div>

        <Button 
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          disabled={!firstName || !lastName || !getCurrentContactValue()}
        >
          Далее
        </Button>
      </form>
    </Card>
  )
}