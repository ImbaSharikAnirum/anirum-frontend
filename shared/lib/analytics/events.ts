/**
 * События аналитики и их типизированные свойства
 * @layer shared/lib/analytics
 */

import { EventPropertiesBase } from './types'

/**
 * Enum всех аналитических событий
 * События добавляются по мере необходимости
 */
export enum AnalyticsEvent {
  // События пока не определены
  // Добавляй их по мере необходимости
  //
  // Пример:
  // COURSE_VIEWED = 'course_viewed',
  // COURSE_ENROLLED = 'course_enrolled',
}

/**
 * Типизированные свойства для каждого события
 * TypeScript будет валидировать properties при вызове track()
 *
 * Пока enum пустой, используем fallback тип
 */
export type EventProperties = Record<string, any>

/**
 * Хелпер тип для получения properties конкретного события
 * Когда добавишь события в enum, используй так:
 *
 * export interface EventPropertiesMap {
 *   [AnalyticsEvent.COURSE_VIEWED]: {
 *     course_id: string
 *     course_name: string
 *   }
 * }
 *
 * export type EventPropertiesFor<E extends AnalyticsEvent> = EventPropertiesMap[E]
 */
export type EventPropertiesFor = Record<string, any>
