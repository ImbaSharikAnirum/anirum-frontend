/**
 * Утилиты для работы с датами
 * @layer shared/lib
 */

/**
 * Форматирует дату в ISO формат (YYYY-MM-DD) БЕЗ учета таймзоны
 * Решает проблему когда .toISOString() сдвигает дату на день назад из-за UTC
 *
 * @example
 * const date = new Date(2012, 3, 27) // 27 апреля 2012
 * formatDateWithoutTimezone(date) // '2012-04-27' (не '2012-04-26'!)
 */
export function formatDateWithoutTimezone(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Парсит ISO дату (YYYY-MM-DD) БЕЗ учета таймзоны
 * Возвращает Date объект с локальной полночью, а не UTC
 *
 * @example
 * parseDateWithoutTimezone('2012-04-27') // Date(2012, 3, 27, 0, 0, 0) в локальной таймзоне
 */
export function parseDateWithoutTimezone(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}