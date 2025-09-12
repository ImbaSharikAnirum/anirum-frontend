/**
 * Компонент для ввода суммы бонусов к использованию
 * @layer shared/ui
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Coins, AlertCircle, Info } from 'lucide-react'

interface BonusInputProps {
  coursePrice: number
  availableBalance: number
  discountAmount?: number // скидка от промокода
  onBonusChange: (amount: number) => void
  className?: string
  disabled?: boolean
}

export function BonusInput({
  coursePrice,
  availableBalance,
  discountAmount = 0,
  onBonusChange,
  className = '',
  disabled = false
}: BonusInputProps) {
  const [bonusAmount, setBonusAmount] = useState<number>(0)
  const [inputValue, setInputValue] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Убираем все ограничения - пользователь может потратить 100% бонусов

  // Простой расчет: максимум = минимум из баланса и стоимости курса
  const priceAfterDiscount = coursePrice - discountAmount
  const absoluteMaxBonuses = Math.min(availableBalance, priceAfterDiscount)

  const validateBonusAmount = (amount: number): string | null => {
    if (amount < 0) return 'Сумма не может быть отрицательной'
    if (amount > availableBalance) return `Недостаточно бонусов на балансе (${formatPrice(availableBalance)})`
    if (amount > priceAfterDiscount) return `Нельзя больше стоимости курса (${formatPrice(priceAfterDiscount)})`
    
    return null
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    
    if (!value.trim()) {
      setBonusAmount(0)
      setError(null)
      onBonusChange(0)
      return
    }

    const numValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'))
    
    if (isNaN(numValue)) {
      setError('Введите корректную сумму')
      return
    }

    const validationError = validateBonusAmount(numValue)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setBonusAmount(numValue)
    onBonusChange(numValue)
  }

  const handleUseMax = () => {
    const maxAmount = absoluteMaxBonuses
    setInputValue(maxAmount.toString())
    setBonusAmount(maxAmount)
    setError(null)
    onBonusChange(maxAmount)
  }

  const handleClear = () => {
    setInputValue('')
    setBonusAmount(0)
    setError(null)
    onBonusChange(0)
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + '₽'
  }

  // Если нет доступных бонусов, не показываем компонент
  if (availableBalance <= 0) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coins className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="bonus-amount">Использовать бонусы</Label>
        </div>
        <Badge variant="secondary" className="text-xs">
          Доступно: {formatPrice(availableBalance)}
        </Badge>
      </div>
      
      <div className="flex space-x-2">
        <Input
          id="bonus-amount"
          placeholder="0"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          className="flex-1"
          type="text"
          inputMode="numeric"
        />
        
        {bonusAmount > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={disabled}
            className="min-w-[80px]"
          >
            Сбросить
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleUseMax}
            disabled={disabled || absoluteMaxBonuses <= 0}
            className="min-w-[80px]"
          >
            Максимум
          </Button>
        )}
      </div>

      {/* Информация об использовании */}
      {bonusAmount > 0 && !error && (
        <Alert className="border-green-200 bg-green-50">
          <Coins className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex justify-between items-center">
              <span>Будет использовано бонусов:</span>
              <span className="font-semibold">{formatPrice(bonusAmount)}</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Ошибка валидации */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Убрали все подсказки - пользователь поймет ограничения из валидации */}
    </div>
  )
}