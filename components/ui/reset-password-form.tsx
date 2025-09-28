'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) {
      toast.error("Некорректная ссылка для сброса пароля")
      router.push('/auth/forgot-password')
    }
  }, [code, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password.trim() || !passwordConfirmation.trim()) {
      toast.error("Заполните все поля")
      return
    }

    if (password !== passwordConfirmation) {
      toast.error("Пароли не совпадают")
      return
    }

    if (password.length < 6) {
      toast.error("Пароль должен содержать минимум 6 символов")
      return
    }

    if (!code) {
      toast.error("Отсутствует код для сброса пароля")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          password: password.trim(),
          passwordConfirmation: passwordConfirmation.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при сбросе пароля')
      }

      setIsSuccess(true)
      toast.success(data.message || "Пароль успешно изменен")

      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (error) {
      console.error('Reset password error:', error)
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  if (!code) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Ошибка</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Некорректная ссылка для сброса пароля
          </p>
        </div>
        <div className="text-center text-sm">
          <a href="/auth/forgot-password" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Запросить новую ссылку
          </a>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Пароль изменен</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Ваш пароль успешно изменен. Сейчас вы будете перенаправлены на главную страницу.
            </p>
          </div>
        </div>
        <div className="text-center text-sm">
          <a href="/" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary">
            Перейти на главную
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Новый пароль</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Введите новый пароль для вашего аккаунта
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="password">Новый пароль</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Введите новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="passwordConfirmation">Подтвердите пароль</Label>
          <div className="relative">
            <Input
              id="passwordConfirmation"
              type={showPasswordConfirmation ? "text" : "password"}
              placeholder="Повторите новый пароль"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              autoComplete="new-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full whitespace-normal leading-tight py-3 h-auto"
        >
          {isLoading ? "Сохраняем..." : "Изменить пароль"}
        </Button>
      </div>
      <div className="text-center text-sm">
        <a href="/auth/login" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Вернуться к входу
        </a>
      </div>
    </form>
  )
}