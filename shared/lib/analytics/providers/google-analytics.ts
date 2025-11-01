/**
 * Google Analytics 4 Provider
 * @layer shared/lib/analytics/providers
 */

import { IAnalyticsProvider } from './base'
import { AnalyticsEvent, EventProperties } from '../events'
import { UserTraits } from '../types'

/**
 * Расширяем Window для TypeScript
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

/**
 * Провайдер Google Analytics 4
 * Фокус: marketing attribution, traffic analysis, SEO, content performance
 */
export class GoogleAnalyticsProvider implements IAnalyticsProvider {
  readonly name = 'Google Analytics'
  private isInitialized = false
  private measurementId: string | null = null

  /**
   * Инициализация GA4
   * GA уже инициализирован через Script в layout.tsx,
   * мы только проверяем доступность
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    this.measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null

    if (!this.measurementId) {
      console.warn(`[${this.name}] Measurement ID не найден в env`)
      return
    }

    // Проверяем что gtag доступен (инициализирован через Script в layout)
    if (typeof window.gtag !== 'function') {
      console.warn(`[${this.name}] gtag не найден. Проверьте Script в layout.tsx`)
      return
    }

    this.isInitialized = true
    console.log(`✅ ${this.name} инициализирован`)
  }

  /**
   * Отправка события
   * Конвертируем событие в snake_case для GA
   */
  track<E extends AnalyticsEvent>(
    event: E,
    properties?: EventProperties[E]
  ): void {
    if (!this.isInitialized || !window.gtag) return

    try {
      // Конвертируем "Visited Landing Page" → "visited_landing_page"
      const eventName = event.toLowerCase().replace(/\s+/g, '_')

      window.gtag('event', eventName, properties as any)
    } catch (error) {
      console.error(`[${this.name}] Track error:`, error)
    }
  }

  /**
   * Идентификация пользователя в GA4
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this.isInitialized || !window.gtag || !this.measurementId) return

    try {
      window.gtag('config', this.measurementId, {
        user_id: userId,
        ...traits,
      })
    } catch (error) {
      console.error(`[${this.name}] Identify error:`, error)
    }
  }
}
