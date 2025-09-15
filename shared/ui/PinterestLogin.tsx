"use client"

import { Button } from "@/components/ui/button"

interface PinterestLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export function PinterestLogin({
  onSuccess,
  onError,
  className = "",
  children = "Подключить Pinterest"
}: PinterestLoginProps) {

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_PINTEREST_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_PINTEREST_REDIRECT_URI

    if (!clientId || !redirectUri) {
      const error = 'Не настроены параметры Pinterest OAuth'
      console.error(error)
      onError?.(error)
      return
    }

    const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=pins:read,boards:read`

    // Переадресация на Pinterest для авторизации
    window.location.href = authUrl
  }

  return (
    <Button
      onClick={handleLogin}
      variant="outline"
      className={className}
    >
      {children}
    </Button>
  )
}