/**
 * Компонент для ввода и валидации реферального промокода
 * @layer shared/ui
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2, Tag } from 'lucide-react'
import { referralAPI, type ValidateCodeResponse } from '@/entities/referral'

interface ReferralCodeInputProps {
  coursePrice: number
  onValidCode?: (result: ValidateCodeResponse) => void
  onInvalidCode?: (error: string) => void
  className?: string
  disabled?: boolean
}

export function ReferralCodeInput({
  coursePrice,
  onValidCode,
  onInvalidCode,
  className = '',
  disabled = false
}: ReferralCodeInputProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidateCodeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleValidate = async () => {
    if (!code.trim()) {
      setError('Введите промокод')
      return
    }

    if (coursePrice <= 0) {
      setError('Некорректная стоимость курса')
      return
    }

    setIsValidating(true)
    setError(null)
    setValidationResult(null)

    try {
      const result = await referralAPI.validateCode({
        code: code.trim().toUpperCase(),
        coursePrice
      })

      if (result.isValid) {
        setValidationResult(result)
        onValidCode?.(result)
      } else {
        setError(result.error || 'Промокод недействителен')
        onInvalidCode?.(result.error || 'Промокод недействителен')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при проверке промокода'
      setError(errorMessage)
      onInvalidCode?.(errorMessage)
    } finally {
      setIsValidating(false)
    }
  }

  const handleReset = () => {
    setCode('')
    setError(null)
    setValidationResult(null)
    onInvalidCode?.('')
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + '₽'
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="referral-code">Промокод (необязательно)</Label>
      </div>
      
      <div className="flex space-x-2">
        <Input
          id="referral-code"
          placeholder="Введите промокод"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          disabled={disabled || isValidating || validationResult?.isValid}
          maxLength={20}
          className="flex-1"
        />
        
        {!validationResult?.isValid ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleValidate}
            disabled={disabled || isValidating || !code.trim()}
            className="min-w-[100px]"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Проверка
              </>
            ) : (
              'Применить'
            )}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={disabled}
            className="min-w-[100px]"
          >
            Убрать
          </Button>
        )}
      </div>

      {/* Результат валидации */}
      {validationResult?.isValid && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex justify-between items-center">
              <span>
                Промокод <strong>{code}</strong> применен!
              </span>
              <span className="font-semibold">
                Скидка {formatPrice(validationResult.discountAmount || 0)}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Ошибка */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Дополнительная информация */}
      {validationResult?.isValid && validationResult.referralCode && (
        <div className="text-xs text-muted-foreground">
          Скидка: {validationResult.referralCode.discountPercentage}% от стоимости курса
        </div>
      )}
    </div>
  )
}