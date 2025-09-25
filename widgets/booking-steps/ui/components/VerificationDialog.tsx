'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Smartphone, MessageSquare, Clock, RotateCcw } from 'lucide-react'

interface VerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phone: string
  messenger: 'whatsapp' | 'telegram'
  onSuccess: () => void
}

type VerificationStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'verified' | 'error'

export function VerificationDialog({
  open,
  onOpenChange,
  phone,
  messenger,
  onSuccess
}: VerificationDialogProps) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<VerificationStatus>('idle')
  const [timeLeft, setTimeLeft] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Автоматически отправляем код при открытии диалога
  useEffect(() => {
    if (open && status === 'idle') {
      sendCode()
    }
  }, [open])

  // Сброс состояния при закрытии
  useEffect(() => {
    if (!open) {
      setCode('')
      setStatus('idle')
      setTimeLeft(0)
      setError(null)
    }
  }, [open])

  // Таймер обратного отсчета
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (timeLeft > 0 && status === 'sent') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [timeLeft, status])

  // Форматирование времени MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Отправка кода
  const sendCode = async () => {
    setStatus('sending')
    setError(null)

    console.log('📤 Отправка кода верификации:', { phone, messenger })

    try {
      const response = await fetch('/api/phone-verification/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phone,
          messenger
        })
      })

      const data = await response.json()
      console.log('📥 Ответ сервера:', { status: response.status, data })

      if (!response.ok) {
        console.error('❌ Ошибка запроса:', data)
        throw new Error(data.error?.message || 'Ошибка отправки кода')
      }

      setStatus('sent')
      setTimeLeft(300) // 5 минут
      toast.success(`Код отправлен в ${messenger === 'whatsapp' ? 'WhatsApp' : 'Telegram'}`)

    } catch (error) {
      console.error('Ошибка отправки кода:', error)
      setStatus('error')
      setError(error instanceof Error ? error.message : 'Ошибка отправки кода')
      toast.error('Ошибка отправки кода')
    }
  }

  // Проверка кода
  const verifyCode = async () => {
    if (code.length !== 6) {
      toast.error('Код должен содержать 6 цифр')
      return
    }

    setStatus('verifying')
    setError(null)

    try {
      const response = await fetch('/api/phone-verification/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          phone,
          code
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || 'Неверный код')
      }

      setStatus('verified')
      toast.success('Номер успешно подтвержден!')

      // Закрываем диалог и вызываем onSuccess через небольшую задержку
      setTimeout(() => {
        onOpenChange(false)
        onSuccess()
      }, 1000)

    } catch (error) {
      console.error('Ошибка проверки кода:', error)
      setStatus('sent') // Возвращаемся к состоянию ввода
      setError(error instanceof Error ? error.message : 'Неверный код')
      setCode('') // Очищаем поле ввода
      toast.error(error instanceof Error ? error.message : 'Неверный код')
    }
  }

  // Обработка ввода кода (только цифры, максимум 6)
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setCode(numericValue)
    setError(null)
  }

  // Повторная отправка кода
  const resendCode = async () => {
    setCode('')
    setError(null)
    await sendCode()
  }

  const messengerIcon = messenger === 'whatsapp' ? <MessageSquare className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />
  const messengerName = messenger === 'whatsapp' ? 'WhatsApp' : 'Telegram'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            {messengerIcon}
          </div>
          <DialogTitle className="text-center">
            Подтверждение номера
          </DialogTitle>
          <DialogDescription className="text-center">
            Код подтверждения отправлен на номер{' '}
            <span className="font-medium">{phone}</span> в {messengerName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Состояние: Отправка */}
          {status === 'sending' && (
            <div className="text-center space-y-4">
              <RotateCcw className="h-8 w-8 mx-auto animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Отправляем код...</p>
            </div>
          )}

          {/* Состояние: Ошибка */}
          {status === 'error' && (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <Button onClick={sendCode} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Попробовать еще раз
              </Button>
            </div>
          )}

          {/* Состояние: Код отправлен или проверяется */}
          {(status === 'sent' || status === 'verifying') && (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="verification-code">
                  Введите код из сообщения
                </Label>
                <Input
                  id="verification-code"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="000000"
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <Button
                onClick={verifyCode}
                disabled={code.length !== 6 || status === 'verifying'}
                className="w-full"
              >
                {status === 'verifying' ? (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                    Проверяем...
                  </>
                ) : (
                  'Подтвердить'
                )}
              </Button>

              {/* Таймер и повторная отправка */}
              <div className="text-center text-sm">
                {timeLeft > 0 ? (
                  <div className="flex items-center justify-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    Повторно через {formatTime(timeLeft)}
                  </div>
                ) : (
                  <Button
                    variant="link"
                    onClick={resendCode}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Отправить еще раз
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Состояние: Успешная верификация */}
          {status === 'verified' && (
            <div className="text-center space-y-4">
              <div className="text-green-600 text-5xl">✅</div>
              <div>
                <h4 className="font-medium text-green-700 mb-1">
                  Номер подтвержден!
                </h4>
                <p className="text-sm text-gray-600">
                  Переходим к следующему шагу...
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}