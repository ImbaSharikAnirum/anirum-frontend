/**
 * Главный менеджер аналитики
 * Управляет всеми analytics провайдерами и отправляет события
 * @layer shared/lib/analytics
 */

import type { IAnalyticsProvider } from './providers'
import { MixpanelProvider, GoogleAnalyticsProvider } from './providers'
import type { AnalyticsEvent, EventProperties } from './events'
import type { UserTraits } from './types'

/**
 * Analytics Manager - Singleton
 * Агрегирует все провайдеры и отправляет события во все активные
 */
class AnalyticsManager {
  private providers: IAnalyticsProvider[] = []
  private isInitialized = false

  /**
   * Инициализация всех провайдеров
   * Провайдеры регистрируются автоматически на основе env переменных
   */
  init(): void {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    // Регистрируем провайдеры если есть токены
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      this.providers.push(new MixpanelProvider())
    }

    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      this.providers.push(new GoogleAnalyticsProvider())
    }

    // Инициализируем каждый провайдер
    this.providers.forEach(provider => {
      try {
        provider.init()
      } catch (error) {
        console.error(`[Analytics] Ошибка инициализации ${provider.name}:`, error)
      }
    })

    this.isInitialized = true
    console.log(`✅ Analytics Manager инициализирован с ${this.providers.length} провайдерами`)
  }

  /**
   * Отправка события во все провайдеры
   * Type-safe благодаря EventProperties mapping
   */
  track<E extends AnalyticsEvent>(
    event: E,
    properties?: EventProperties[E]
  ): void {
    if (!this.isInitialized) {
      console.warn('[Analytics] Попытка track до инициализации')
      return
    }

    this.providers.forEach(provider => {
      try {
        provider.track(event, properties)
      } catch (error) {
        console.error(`[${provider.name}] Track error:`, error)
      }
    })
  }

  /**
   * Идентификация пользователя во всех провайдерах
   */
  identify(userId: string, traits?: UserTraits): void {
    if (!this.isInitialized) {
      console.warn('[Analytics] Попытка identify до инициализации')
      return
    }

    this.providers.forEach(provider => {
      try {
        provider.identify(userId, traits)
      } catch (error) {
        console.error(`[${provider.name}] Identify error:`, error)
      }
    })
  }

  /**
   * Установка свойств пользователя
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isInitialized) return

    this.providers.forEach(provider => {
      try {
        provider.setUserProperties(properties)
      } catch (error) {
        console.error(`[${provider.name}] Set properties error:`, error)
      }
    })
  }

  /**
   * Трекинг revenue во всех провайдерах
   */
  trackRevenue(amount: number, properties?: Record<string, any>): void {
    if (!this.isInitialized) return

    this.providers.forEach(provider => {
      try {
        provider.trackRevenue(amount, properties)
      } catch (error) {
        console.error(`[${provider.name}] Track revenue error:`, error)
      }
    })
  }

  /**
   * Инкремент счётчика пользователя
   */
  incrementProperty(property: string, value = 1): void {
    if (!this.isInitialized) return

    this.providers.forEach(provider => {
      try {
        provider.incrementProperty(property, value)
      } catch (error) {
        console.error(`[${provider.name}] Increment error:`, error)
      }
    })
  }

  /**
   * Сброс данных (logout)
   */
  reset(): void {
    if (!this.isInitialized) return

    this.providers.forEach(provider => {
      try {
        provider.reset()
      } catch (error) {
        console.error(`[${provider.name}] Reset error:`, error)
      }
    })
  }

  /**
   * Трекинг pageview (для GA и других)
   */
  trackPageView(path: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) return

    this.providers.forEach(provider => {
      try {
        if (provider.trackPageView) {
          provider.trackPageView(path, properties)
        }
      } catch (error) {
        console.error(`[${provider.name}] Page view error:`, error)
      }
    })
  }

  /**
   * Получить список активных провайдеров (для дебага)
   */
  getActiveProviders(): string[] {
    return this.providers.map(p => p.name)
  }
}

/**
 * Singleton instance
 * Экспортируем единственный экземпляр менеджера
 */
export const analytics = new AnalyticsManager()
