'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/entities/user'
import { APIError } from '@/shared/api/base'

interface AuthStepProps {
  onNext: () => void
}

export function AuthStep({ onNext }: AuthStepProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  
  const { setUser } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ identifier: email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new APIError({
          message: error.error?.message || 'Login failed',
          status: response.status,
          details: error
        })
      }

      const { user } = await response.json()
      setUser(user)
      onNext()
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, username }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new APIError({
          message: error.error?.message || 'Registration failed',
          status: response.status,
          details: error
        })
      }

      const { user } = await response.json()
      setUser(user)
      onNext()
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

  return (
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
            className="w-full"
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
            className="w-full"
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
}