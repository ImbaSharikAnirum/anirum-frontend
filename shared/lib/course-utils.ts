/**
 * Утилиты для работы с курсами
 * @layer shared
 */

// Маппинг направлений курсов из API в читаемый текст
export const DIRECTION_MAP = {
  sketching: 'Скетчинг',
  drawing2d: '2D Рисование', 
  animation: 'Анимация',
  modeling3d: '3D Моделирование'
} as const

// Маппинг валют из API в символы
export const CURRENCY_MAP = {
  RUB: '₽',
  USD: '$',
  EUR: '€'
} as const

// Маппинг дней недели из английского в русский
export const WEEKDAY_MAP = {
  monday: 'Понедельник',
  tuesday: 'Вторник', 
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье'
} as const

// Сокращенные названия дней недели
export const SHORT_WEEKDAY_MAP = {
  monday: 'Пн',
  tuesday: 'Вт',
  wednesday: 'Ср', 
  thursday: 'Чт',
  friday: 'Пт',
  saturday: 'Сб',
  sunday: 'Вс'
} as const

// Маппинг сложности курсов из API в читаемый текст
export const COMPLEXITY_MAP = {
  beginner: 'для начинающих',
  experienced: 'для опытных', 
  professional: 'для профессионалов'
} as const

/**
 * Получает читаемое название направления курса
 */
export function getDirectionDisplayName(direction: string): string {
  return DIRECTION_MAP[direction as keyof typeof DIRECTION_MAP] || direction
}

/**
 * Получает читаемое название сложности курса
 */
export function getComplexityDisplayName(complexity: string): string {
  return COMPLEXITY_MAP[complexity as keyof typeof COMPLEXITY_MAP] || complexity
}

/**
 * Получает символ валюты
 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_MAP[currency as keyof typeof CURRENCY_MAP] || currency
}

/**
 * Преобразует английские названия дней недели в русские
 */
export function translateWeekdays(weekdays: string[]): string[] {
  return weekdays.map(day => 
    WEEKDAY_MAP[day.toLowerCase() as keyof typeof WEEKDAY_MAP] || day
  )
}

/**
 * Преобразует английские названия дней недели в короткие русские
 */
export function translateWeekdaysShort(weekdays: string[]): string[] {
  return weekdays.map(day => 
    SHORT_WEEKDAY_MAP[day.toLowerCase() as keyof typeof SHORT_WEEKDAY_MAP] || day
  )
}

/**
 * Форматирует дни недели с автоматическим сокращением для длинных списков
 */
export function formatWeekdays(weekdays: string[]): string {
  const translated = translateWeekdays(weekdays)
  
  if (translated.length <= 3) {
    return translated.join(', ')
  }
  
  const shortTranslated = translateWeekdaysShort(weekdays)
  return shortTranslated.join(', ')
}

/**
 * Получает полный URL изображения для Strapi
 */
export function getStrapiImageUrl(url: string, baseURL?: string): string {
  // Если уже полный URL, возвращаем как есть
  if (url.startsWith('http')) {
    return url
  }
  
  // Используем базовый URL из переменных окружения или дефолтный
  const strapiBaseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://anirum.up.railway.app'
  
  // Убираем /api из базового URL если он есть
  const cleanBaseURL = strapiBaseURL.replace('/api', '')
  
  return `${cleanBaseURL}${url}`
}

/**
 * Получает оптимальный формат изображения для контекста с приоритетом качества
 */
export function getOptimalImageFormat(
  image: any, 
  context: 'card' | 'modal' | 'hero' | 'thumbnail' = 'card'
): string {
  if (typeof image === 'string') {
    return getStrapiImageUrl(image)
  }

  if (!image?.formats) {
    return getStrapiImageUrl(image.url)
  }

  switch (context) {
    case 'card':
      // Для карточек используем large формат (1000px) для максимального качества на ретина дисплеях
      return getStrapiImageUrl(image.formats.large?.url || image.url || image.formats.medium?.url)
    case 'modal':
      // Для модальных окон всегда используем оригинал
      return getStrapiImageUrl(image.url)
    case 'hero':
      // Для hero секций используем оригинал или large формат
      return getStrapiImageUrl(image.url || image.formats.large?.url)
    case 'thumbnail':
      // Для миниатюр используем medium формат
      return getStrapiImageUrl(image.formats.medium?.url || image.formats.small?.url || image.url)
    default:
      return getStrapiImageUrl(image.url)
  }
}