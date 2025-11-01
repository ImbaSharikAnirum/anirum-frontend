/**
 * Базовый интерфейс для всех analytics провайдеров
 * @layer shared/lib/analytics/providers
 */

import { AnalyticsEvent, EventProperties } from '../events'
import { UserTraits } from '../types'

/**
 * Базовый интерфейс провайдера аналитики
 * Все провайдеры (Mixpanel, GA) должны реализовать эти методы
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
  track(
    event: AnalyticsEvent,
    properties?: EventProperties
  ): void

  /**
   * Идентификация пользователя
   * @param userId - Уникальный ID пользователя
   * @param traits - Дополнительные свойства пользователя
   */
  identify(userId: string, traits?: UserTraits): void
}
