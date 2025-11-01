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
}

/**
 * Типизированные свойства для каждого события
 * TypeScript будет валидировать properties при вызове track()
 */
export interface EventProperties {
  // Properties пока не определены
  // Добавляй их вместе с событиями
}

/**
 * Хелпер тип для получения properties конкретного события
 */
export type EventPropertiesFor<E extends AnalyticsEvent> = EventProperties[E]
