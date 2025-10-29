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

// Re-export методов для удобства (можно вызывать напрямую)
import { analytics } from './analytics-manager'

export const {
  track,
  identify,
  setUserProperties,
  trackRevenue,
  incrementProperty,
  reset,
  trackPageView,
} = {
  track: analytics.track.bind(analytics),
  identify: analytics.identify.bind(analytics),
  setUserProperties: analytics.setUserProperties.bind(analytics),
  trackRevenue: analytics.trackRevenue.bind(analytics),
  incrementProperty: analytics.incrementProperty.bind(analytics),
  reset: analytics.reset.bind(analytics),
  trackPageView: analytics.trackPageView.bind(analytics),
}
