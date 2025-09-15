"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/entities/user'

export default function PinterestCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      if (!searchParams) {
        setStatus('error')
        setMessage('Ошибка получения параметров')
        setTimeout(() => router.push('/guides'), 3000)
        return
      }

      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage('Авторизация Pinterest отменена')
        setTimeout(() => router.push('/guides'), 3000)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('Не получен код авторизации')
        setTimeout(() => router.push('/guides'), 3000)
        return
      }

      if (!user) {
        setStatus('error')
        setMessage('Необходимо войти в аккаунт')
        setTimeout(() => router.push('/auth/login'), 3000)
        return
      }

      try {
        // Используем Next.js API route вместо прямого обращения к Strapi
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pinterest/auth`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Важно для передачи cookies
          body: JSON.stringify({
            code,
            userId: user.documentId
          }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage('Pinterest успешно подключен!')
          setTimeout(() => router.push('/guides'), 2000)
        } else {
          throw new Error(data.error?.message || 'Ошибка при подключении Pinterest')
        }
      } catch (error) {
        console.error('Ошибка Pinterest callback:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'Произошла ошибка')
        setTimeout(() => router.push('/guides'), 3000)
      }
    }

    // Выполняем только если есть user и код
    if (user !== undefined) {
      handleCallback()
    }
  }, [searchParams, router, user])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Подключаем Pinterest...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-2xl mb-4">✓</div>
            <p className="text-green-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Перенаправляем на страницу гайдов...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 text-2xl mb-4">✗</div>
            <p className="text-red-600">{message}</p>
            <p className="text-sm text-gray-500 mt-2">Возвращаемся назад...</p>
          </>
        )}
      </div>
    </div>
  )
}