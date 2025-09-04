'use client'

import { useState, useEffect } from 'react'

interface TimezoneInfo {
  timezone: string
  utcOffset: number
  abbr: string
  isDst: boolean
}

interface IPInfoResponse {
  timezone?: string
}

const IPINFO_TOKEN = process.env.NEXT_PUBLIC_IPINFO_TOKEN

export function useUserTimezone() {
  const [userTimezone, setUserTimezone] = useState<TimezoneInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const detectTimezone = async () => {
      try {
        // Fallback: используем локальный часовой пояс браузера
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const now = new Date()
        const utcOffset = -now.getTimezoneOffset() / 60
        
        let detectedTimezone = browserTimezone
        
        // Если есть токен IPinfo, пытаемся получить более точную информацию
        if (IPINFO_TOKEN) {
          try {
            const response = await fetch(`https://ipinfo.io/json?token=${IPINFO_TOKEN}`)
            if (response.ok) {
              const data: IPInfoResponse = await response.json()
              if (data.timezone) {
                detectedTimezone = data.timezone
              }
            }
          } catch (ipError) {
            // Игнорируем ошибку API и используем браузерный часовой пояс
            console.warn('Failed to fetch IP timezone, using browser timezone:', ipError)
          }
        }

        // Получаем детальную информацию о часовом поясе
        const formatter = new Intl.DateTimeFormat('en', {
          timeZone: detectedTimezone,
          timeZoneName: 'short'
        })
        
        const parts = formatter.formatToParts(now)
        const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value || ''
        
        // Определяем смещение UTC для конкретного часового пояса
        const utcDate = new Date(now.toISOString())
        const localDate = new Date(now.toLocaleString('en-US', { timeZone: detectedTimezone }))
        const offset = (utcDate.getTime() - localDate.getTime()) / (1000 * 60 * 60)

        if (mounted) {
          setUserTimezone({
            timezone: detectedTimezone,
            utcOffset: -offset,
            abbr: timeZoneName,
            isDst: now.getTimezoneOffset() !== new Date(now.getFullYear(), 0, 1).getTimezoneOffset()
          })
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to detect timezone')
          setLoading(false)
        }
      }
    }

    detectTimezone()

    return () => {
      mounted = false
    }
  }, [])

  return { 
    userTimezone, 
    loading, 
    error,
    // Utility функция для быстрого доступа к часовому поясу
    timezone: userTimezone?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}