'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Введите email адрес")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке запроса')
      }

      setIsSuccess(true)
      toast.success(data.message || "Ссылка для восстановления отправлена на ваш email")

    } catch (error) {
      console.error('Forgot password error:', error)
      toast.error(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Проверьте email</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Мы отправили ссылку для восстановления пароля на <strong>{email}</strong>
            </p>
          </div>
        </div>
        <div className="text-center text-sm space-y-4">
          <p className="text-muted-foreground">
            Не получили письмо? Проверьте папку спам или попробуйте снова
          </p>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-primary hover:underline"
          >
            Попробовать другой email
          </button>
        </div>
        <div className="text-center text-sm">
          <a href="/auth/login" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Вернуться к входу
          </a>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Забыли пароль?</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Введите ваш email и мы отправим ссылку для восстановления пароля
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full whitespace-normal leading-tight py-3 h-auto"
        >
          {isLoading ? "Отправляем..." : "Отправить ссылку для восстановления"}
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