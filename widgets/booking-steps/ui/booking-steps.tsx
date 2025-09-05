'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Course } from '@/entities/course/model/types'
import { MessengerInput } from '@/components/ui/messenger-input'
import { useUser, userAuthAPI } from '@/entities/user'
import { APIError } from '@/shared/api/base'

interface BookingStepsProps {
  course: Course
  className?: string
}

type BookingStep = 'auth' | 'contact' | 'student' | 'confirmation'

export function BookingSteps({ course, className }: BookingStepsProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('auth')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  
  // Данные для контактного этапа
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [messenger, setMessenger] = useState<'whatsapp' | 'telegram'>('whatsapp')
  const [messengerContact, setMessengerContact] = useState('')
  const [telegramMode, setTelegramMode] = useState<'phone' | 'username'>('phone')
  
  const { user, isAuthenticated, setAuth } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    if (isAuthenticated && user) {
      setCurrentStep('contact')
    }
  }, [isAuthenticated, user])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await userAuthAPI.login({ identifier: email, password })
      
      // Получаем полные данные пользователя с ролью
      const userWithRole = await userAuthAPI.getCurrentUser(response.jwt)
      
      // Сохраняем данные пользователя в store
      setAuth(userWithRole, response.jwt)
      
      // НЕ перенаправляем, остаемся в процессе бронирования
      // setCurrentStep('contact') - произойдет через useEffect
      
    } catch (err) {
      if (err instanceof APIError) {
        setError(getLoginErrorMessage(err))
      } else {
        setError('Произошла неожиданная ошибка')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !username) return
    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await userAuthAPI.register({ email, password, username })
      
      // Получаем полные данные пользователя с ролью
      const userWithRole = await userAuthAPI.getCurrentUser(response.jwt)
      
      // Сохраняем данные пользователя в store
      setAuth(userWithRole, response.jwt)
      
      // НЕ перенаправляем, остаемся в процессе бронирования
      // setCurrentStep('contact') - произойдет через useEffect
      
    } catch (err) {
      if (err instanceof APIError) {
        setError(getSignupErrorMessage(err))
      } else {
        setError('Произошла неожиданная ошибка')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getLoginErrorMessage = (error: APIError): string => {
    switch (error.status) {
      case 400:
        return 'Неверный email или пароль'
      case 429:
        return 'Слишком много попыток. Попробуйте позже'
      case 500:
        return 'Ошибка сервера. Попробуйте позже'
      default:
        return error.message || 'Произошла ошибка при входе'
    }
  }

  const getSignupErrorMessage = (error: APIError): string => {
    switch (error.status) {
      case 400:
        if (error.message.includes('email')) {
          return 'Пользователь с таким email уже существует'
        }
        if (error.message.includes('username')) {
          return 'Пользователь с таким именем уже существует'  
        }
        return 'Проверьте правильность введенных данных'
      case 429:
        return 'Слишком много попыток. Попробуйте позже'
      case 500:
        return 'Ошибка сервера. Попробуйте позже'
      default:
        return error.message || 'Произошла ошибка при регистрации'
    }
  }

  const renderAuthStep = () => (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">
          Чтобы оформить бронирование, войдите или зарегистрируйтесь
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">
          {error}
        </div>
      )}

      {/* Форма входа */}
      {!isRegisterMode && (
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Входим...' : 'Войти'}
          </Button>

          <div className="text-center">
            <Button 
              type="button"
              variant="link" 
              onClick={() => setIsRegisterMode(true)}
              disabled={isLoading}
            >
              Нет аккаунта? Зарегистрироваться
            </Button>
          </div>
        </form>
      )}

      {/* Форма регистрации */}
      {isRegisterMode && (
        <form onSubmit={handleSignup} className="space-y-4" autoComplete="on">
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input 
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              minLength={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <Input 
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading || password !== confirmPassword}
          >
            {isLoading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
          </Button>

          <div className="text-center">
            <Button 
              type="button"
              variant="link" 
              onClick={() => setIsRegisterMode(false)}
              disabled={isLoading}
            >
              Уже есть аккаунт? Войти
            </Button>
          </div>
        </form>
      )}

      <div className="text-xs text-gray-500 text-center mt-4">
        Продолжая, вы соглашаетесь с положениями{' '}
        <a href="/terms" className="underline hover:text-gray-700">
          Пользовательского соглашения
        </a>{' '}
        и{' '}
        <a href="/privacy" className="underline hover:text-gray-700">
          Политики конфиденциальности
        </a>.
      </div>
    </Card>
  )

  const renderContactStep = () => (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-2">Укажите ваши данные</h3>
      <p className="text-sm text-gray-600 mb-4">
        На этом этапе записываете данные того, кто записывается. 
        Данные ученика заполните на следующем этапе.
      </p>
      
      <form onSubmit={(e) => { e.preventDefault(); setCurrentStep('student') }} className="space-y-4">
        {/* Имя и фамилия */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Введите имя"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
            onMessengerChange={setMessenger}
            telegramMode={telegramMode}
            onTelegramModeChange={setTelegramMode}
            value={messengerContact}
            onValueChange={setMessengerContact}
          />
        </div>

        <Button 
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          disabled={!firstName || !lastName || !messengerContact}
        >
          Далее
        </Button>
      </form>
    </Card>
  )

  const renderStudentStep = () => (
    <Card className="p-6">
      <div className="text-center">
        <p>Этап 3: Выбор ученика (в разработке)</p>
        <Button 
          onClick={() => setCurrentStep('confirmation')}
          className="mt-4"
        >
          Далее
        </Button>
      </div>
    </Card>
  )

  const renderConfirmationStep = () => (
    <Card className="p-6">
      <div className="text-center">
        <p>Этап 4: Подтверждение (в разработке)</p>
      </div>
    </Card>
  )

  return (
    <div className={className}>
      {currentStep === 'auth' && renderAuthStep()}
      {currentStep === 'contact' && renderContactStep()}
      {currentStep === 'student' && renderStudentStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  )
}