/**
 * Mixpanel Analytics инициализация
 * @layer shared/lib
 */

import mixpanel from 'mixpanel-browser'

let isInitialized = false

/**
 * Инициализация Mixpanel
 * Вызывается один раз при загрузке приложения
 */
export function initMixpanel() {
  // Проверяем что мы на клиенте и еще не инициализировали
  if (typeof window === 'undefined' || isInitialized) {
    return
  }

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

  if (!token) {
    console.warn('Mixpanel token не найден в переменных окружения')
    return
  }

  try {
    mixpanel.init(token, {
      autocapture: true,
      record_sessions_percent: 100,
      api_host: 'https://api-eu.mixpanel.com',
      // Дополнительные настройки для продакшена
      debug: process.env.NODE_ENV === 'development',
      track_pageview: true,
      persistence: 'localStorage',
    })

    isInitialized = true
    console.log('✅ Mixpanel инициализирован')
  } catch (error) {
    console.error('❌ Ошибка инициализации Mixpanel:', error)
  }
}

/**
 * Экспортируем инстанс Mixpanel для использования в компонентах
 */
export { mixpanel }

/**
 * Хелпер для проверки инициализации
 */
export function isMixpanelInitialized() {
  return isInitialized
}
