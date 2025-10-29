/**
 * События аналитики и их типизированные свойства
 * @layer shared/lib/analytics
 */

import { EventPropertiesBase } from './types'

/**
 * Enum всех аналитических событий
 * Организованы по воронке: Acquisition → Activation → Engagement → Conversion
 */
export enum AnalyticsEvent {
  // 🎯 Acquisition (Привлечение)
  VISITED_LANDING_PAGE = 'Visited Landing Page',
  CLICKED_SIGN_UP = 'Clicked Sign Up',

  // ✨ Activation (Активация)
  REGISTERED = 'Registered',
  COMPLETED_PROFILE = 'Completed Profile',
  STARTED_LESSON = 'Started Lesson',
  COMPLETED_LESSON = 'Completed Lesson',

  // 💬 Engagement (Вовлечённость)
  COMMENTED_ON_LESSON = 'Commented on Lesson',
  UPLOADED_ARTWORK = 'Uploaded Artwork',

  // 💰 Conversion / Revenue (Конверсия)
  CREATED_BOOKING = 'Created Booking',
  PAYMENT_SUCCESS = 'Payment Success',
}

/**
 * Типизированные свойства для каждого события
 * TypeScript будет валидировать properties при вызове track()
 */
export interface EventProperties {
  // 🎯 Acquisition
  [AnalyticsEvent.VISITED_LANDING_PAGE]: {
    referrer?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_content?: string
    utm_term?: string
  } & EventPropertiesBase

  [AnalyticsEvent.CLICKED_SIGN_UP]: {
    button_location: 'header' | 'hero' | 'cta' | 'footer' | 'integrations'
    page_path?: string
  } & EventPropertiesBase

  // ✨ Activation
  [AnalyticsEvent.REGISTERED]: {
    method: 'email' | 'pinterest' | 'google' | 'social'
    role: 'student' | 'teacher' | 'manager'
    referral_code?: string
  } & EventPropertiesBase

  [AnalyticsEvent.COMPLETED_PROFILE]: {
    has_avatar: boolean
    has_bio: boolean
    has_social_links: boolean
    profile_completion_percentage: number
  } & EventPropertiesBase

  [AnalyticsEvent.STARTED_LESSON]: {
    course_id: string
    course_title: string
    lesson_id: string
    lesson_title: string
    lesson_number?: number
    is_first_lesson: boolean
  } & EventPropertiesBase

  [AnalyticsEvent.COMPLETED_LESSON]: {
    course_id: string
    course_title: string
    lesson_id: string
    lesson_title: string
    duration_seconds: number
    completion_percentage: number
  } & EventPropertiesBase

  // 💬 Engagement
  [AnalyticsEvent.COMMENTED_ON_LESSON]: {
    lesson_id: string
    course_id: string
    comment_length: number
    has_mentions: boolean
    is_reply: boolean
  } & EventPropertiesBase

  [AnalyticsEvent.UPLOADED_ARTWORK]: {
    file_type: string
    file_size_kb: number
    has_description: boolean
    tags_count: number
    is_portfolio: boolean
  } & EventPropertiesBase

  // 💰 Conversion
  [AnalyticsEvent.CREATED_BOOKING]: {
    course_id: string
    course_title: string
    price: number
    currency: 'RUB' | 'USD' | 'EUR'
    discount_applied: boolean
    discount_amount?: number
    payment_method?: string
  } & EventPropertiesBase

  [AnalyticsEvent.PAYMENT_SUCCESS]: {
    booking_id: string
    course_id: string
    amount: number
    currency: 'RUB' | 'USD' | 'EUR'
    payment_method: 'tinkoff' | 'card' | 'yandex' | 'paypal'
    transaction_id: string
  } & EventPropertiesBase
}

/**
 * Хелпер тип для получения properties конкретного события
 */
export type EventPropertiesFor<E extends AnalyticsEvent> = EventProperties[E]
