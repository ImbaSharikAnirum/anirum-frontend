/**
 * Public API для analytics провайдеров
 * @layer shared/lib/analytics/providers
 */

export type { IAnalyticsProvider } from './base'
export { MixpanelProvider } from './mixpanel'
export { GoogleAnalyticsProvider } from './google-analytics'
