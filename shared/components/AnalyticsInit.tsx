'use client'

/**
 * Компонент для инициализации всех Analytics провайдеров
 * @layer shared/components
 */

import { useEffect } from 'react'
import { analytics } from '@/shared/lib/analytics'

export function AnalyticsInit() {
  useEffect(() => {
    // Инициализируем все analytics провайдеры при монтировании
    analytics.init()
  }, [])

  // Компонент ничего не рендерит
  return null
}
