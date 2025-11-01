/**
 * Mixpanel Analytics Provider
 * @layer shared/lib/analytics/providers
 */

import mixpanel from 'mixpanel-browser'
import { IAnalyticsProvider } from './base'
import { AnalyticsEvent, EventProperties } from '../events'
import { UserTraits } from '../types'

/**
 * Провайдер Mixpanel для Product Analytics
 * Фокус: retention, cohorts, user journey, revenue tracking
 */
export class MixpanelProvider implements IAnalyticsProvider {
  readonly name = 'Mixpanel'
  private isInitialized = false

  /**
   * Инициализация Mixpanel SDK
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

    if (!token) {
      console.warn(`[${this.name}] Token не найден в env`)
      return
    }

    try {
      mixpanel.init(token, {
        autocapture: true,
        record_sessions_percent: 100,
        api_host: 'https://api-eu.mixpanel.com',
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage',
      })

      this.isInitialized = true
      console.log(`✅ ${this.name} инициализирован`)
    } catch (error) {
      console.error(`❌ ${this.name} ошибка инициализации:`, error)
    }
  }

  /**
   * Отправка события
   */
  track<E extends AnalyticsEvent>(
    event: E,
    properties?: EventProperties[E]
  ): void {
    if (!this.isInitialized) return

    try {
      mixpanel.track(event, properties as any)
    } catch (error) {
      console.error(`[${this.name}] Track error:`, error)
    }
  }

  /**
   * Идентификация пользователя
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this.isInitialized) return

    try {
      mixpanel.identify(userId)

      if (traits) {
        mixpanel.people.set(traits)
      }
    } catch (error) {
      console.error(`[${this.name}] Identify error:`, error)
    }
  }
}
