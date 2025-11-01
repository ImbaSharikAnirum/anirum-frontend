/**
 * Public API для системы аналитики
 * @layer shared/lib/analytics
 *
 * Использование:
 * import { analytics, AnalyticsEvent } from '@/shared/lib/analytics'
 *
 * analytics.track(AnalyticsEvent.REGISTERED, { method: 'email', role: 'student' })
 */

// Экспортируем singleton менеджера
export { analytics } from './analytics-manager'

// Экспортируем типы и события
export { AnalyticsEvent } from './events'
export type { EventProperties, EventPropertiesFor } from './events'
export type { UserTraits, EventProperty } from './types'
export type { IAnalyticsProvider } from './providers'
