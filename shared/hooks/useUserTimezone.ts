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

// Глобальный кеш для предотвращения множественных запросов
let globalTimezoneCache: TimezoneInfo | null = null
let globalTimezonePromise: Promise<TimezoneInfo | null> | null = null

export function useUserTimezone() {
  const [userTimezone, setUserTimezone] = useState<TimezoneInfo | null>(globalTimezoneCache)
  const [loading, setLoading] = useState(!globalTimezoneCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const detectTimezone = async (): Promise<TimezoneInfo | null> => {
      try {
        // Fallback: используем локальный часовой пояс браузера
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const now = new Date()
        
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

        return {
          timezone: detectedTimezone,
          utcOffset: -offset,
          abbr: timeZoneName,
          isDst: now.getTimezoneOffset() !== new Date(now.getFullYear(), 0, 1).getTimezoneOffset()
        }
      } catch (err) {
        console.error('Failed to detect timezone:', err)
        return null
      }
    }

    // Если данные уже кешированы, используем их
    if (globalTimezoneCache && mounted) {
      setUserTimezone(globalTimezoneCache)
      setLoading(false)
      return
    }

    // Если уже есть активный запрос, ждем его
    if (globalTimezonePromise) {
      globalTimezonePromise.then(result => {
        if (mounted) {
          setUserTimezone(result)
          setLoading(false)
          if (!result) {
            setError('Failed to detect timezone')
          }
        }
      })
      return
    }

    // Создаем новый запрос и кешируем промис
    globalTimezonePromise = detectTimezone()
    
    globalTimezonePromise.then(result => {
      if (result) {
        globalTimezoneCache = result
      }
      
      if (mounted) {
        setUserTimezone(result)
        setLoading(false)
        if (!result) {
          setError('Failed to detect timezone')
        }
      }
    }).finally(() => {
      // Очищаем промис после завершения
      globalTimezonePromise = null
    })

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