/**
 * Базовые типы для системы аналитики
 * @layer shared/lib/analytics
 */

/**
 * Базовый тип для свойств событий
 */
export type EventProperty = string | number | boolean | null | undefined

/**
 * Объект свойств события
 */
export interface EventPropertiesBase {
  [key: string]: EventProperty | EventProperty[]
}

/**
 * Метаданные пользователя для identify
 */
export interface UserTraits {
  email?: string
  username?: string
  role?: string
  signup_date?: string
  created_at?: string
  [key: string]: EventProperty
}

/**
 * Параметры инициализации провайдера
 */
export interface ProviderConfig {
  debug?: boolean
  enabled?: boolean
  [key: string]: any
}
