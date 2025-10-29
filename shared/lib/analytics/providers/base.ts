/**
 * Базовый интерфейс для всех analytics провайдеров
 * @layer shared/lib/analytics/providers
 */

import { AnalyticsEvent, EventProperties } from '../events'
import { UserTraits } from '../types'

/**
 * Базовый интерфейс провайдера аналитики
 * Все провайдеры (Mixpanel, GA, Amplitude) должны реализовать эти методы
 */
export interface IAnalyticsProvider {
  /**
   * Название провайдера (для логирования)
   */
  readonly name: string

  /**
   * Инициализация провайдера
   * Вызывается один раз при старте приложения
   */
  init(): void

  /**
   * Отправка события с типизированными properties
   * @param event - Название события из enum
   * @param properties - Свойства события (валидируются TypeScript)
   */
  track<E extends AnalyticsEvent>(
    event: E,
    properties?: EventProperties[E]
  ): void

  /**
   * Идентификация пользователя
   * @param userId - Уникальный ID пользователя
   * @param traits - Дополнительные свойства пользователя
   */
  identify(userId: string, traits?: UserTraits): void

  /**
   * Установка свойств пользователя (обновление профиля)
   * @param properties - Объект со свойствами
   */
  setUserProperties(properties: Record<string, any>): void

  /**
   * Трекинг revenue (для монетизации)
   * @param amount - Сумма в валюте
   * @param properties - Дополнительные свойства транзакции
   */
  trackRevenue(amount: number, properties?: Record<string, any>): void

  /**
   * Инкремент счётчика пользователя
   * Например: total_lessons_completed += 1
   * @param property - Название свойства
   * @param value - Значение для увеличения (по умолчанию 1)
   */
  incrementProperty(property: string, value?: number): void

  /**
   * Сброс данных пользователя (logout)
   * Очищает ID и свойства пользователя
   */
  reset(): void

  /**
   * Трекинг pageview (опционально, в основном для GA)
   * @param path - Путь страницы
   * @param properties - Дополнительные свойства
   */
  trackPageView?(path: string, properties?: Record<string, any>): void
}
