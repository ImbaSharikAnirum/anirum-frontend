'use client'

/**
 * Хук для удобной работы с аналитикой
 * Автоматически обогащает события данными пользователя
 * @layer shared/hooks
 */

import { useCallback } from 'react'
import { analytics, AnalyticsEvent, EventProperties } from '@/shared/lib/analytics'
import { useUser } from '@/entities/user'

/**
 * Хук для трекинга аналитических событий
 * Автоматически добавляет user_id и user_role к каждому событию
 */
export function useAnalytics() {
  const { user } = useUser()

  /**
   * Отправка события с автоматическим обогащением
   */
  const track = useCallback(
    <E extends AnalyticsEvent>(
      event: E,
      properties?: EventProperties[E]
    ) => {
      // Обогащаем свойства данными пользователя
      const enrichedProperties = {
        ...properties,
        user_id: user?.documentId,
        user_role: user?.role?.type,
      } as any

      analytics.track(event, enrichedProperties)
    },
    [user]
  )

  /**
   * Идентификация пользователя
   */
  const identify = useCallback((userId: string, traits?: any) => {
    analytics.identify(userId, traits)
  }, [])

  /**
   * Установка свойств пользователя
   */
  const setProperties = useCallback((properties: Record<string, any>) => {
    analytics.setUserProperties(properties)
  }, [])

  /**
   * Трекинг revenue
   */
  const revenue = useCallback((amount: number, properties?: any) => {
    analytics.trackRevenue(amount, properties)
  }, [])

  /**
   * Инкремент счётчика
   */
  const increment = useCallback((property: string, value = 1) => {
    analytics.incrementProperty(property, value)
  }, [])

  /**
   * Сброс данных (logout)
   */
  const logout = useCallback(() => {
    analytics.reset()
  }, [])

  /**
   * Трекинг pageview
   */
  const pageView = useCallback((path: string, properties?: any) => {
    analytics.trackPageView(path, properties)
  }, [])

  return {
    track,
    identify,
    setProperties,
    revenue,
    increment,
    logout,
    pageView,
  }
}
