/**
 * Утилиты для работы с временными зонами
 */

/**
 * Конвертирует время из одной временной зоны в другую
 * @param time - время в формате HH:MM
 * @param fromTimezone - исходная временная зона
 * @param toTimezone - целевая временная зона (по умолчанию Москва)
 * @returns время в целевой временной зоне в формате HH:MM:SS.SSS
 */
export function convertTimezone(
  time: string, 
  fromTimezone: string, 
  toTimezone: string = 'Europe/Moscow'
): string {
  // Создаем произвольную дату для конвертации (используем сегодня)
  const today = new Date().toISOString().split('T')[0]
  
  // Создаем Date объект с исходной временной зоной
  const sourceDate = new Date(`${today}T${time}:00`)
  
  // Получаем offset для исходной и целевой зон
  const sourceOffset = getTimezoneOffset(fromTimezone, sourceDate)
  const targetOffset = getTimezoneOffset(toTimezone, sourceDate)
  
  // Вычисляем разность в минутах
  const offsetDiff = targetOffset - sourceOffset
  
  // Применяем разность
  const convertedDate = new Date(sourceDate.getTime() + (offsetDiff * 60000))
  
  // Возвращаем время в формате HH:MM:SS.SSS
  return convertedDate.toTimeString().split(' ')[0] + '.000'
}

/**
 * Получает offset для временной зоны в минутах
 */
function getTimezoneOffset(timezone: string, date: Date): number {
  // Создаем Intl.DateTimeFormat для получения offset
  const utcDate = new Date(date.toLocaleString("en-US", {timeZone: "UTC"}))
  const localDate = new Date(date.toLocaleString("en-US", {timeZone: timezone}))
  
  return (utcDate.getTime() - localDate.getTime()) / (1000 * 60)
}

/**
 * Конвертирует время в московское время (упрощенная версия)
 * @param time - время в формате HH:MM
 * @param fromTimezone - исходная временная зона
 * @returns время в московской зоне в формате HH:MM:SS.SSS
 */
export function convertToMoscow(time: string, fromTimezone: string): string {
  return convertTimezone(time, fromTimezone, 'Europe/Moscow')
}



/**
 * Список временных зон для выбора
 */
export const TIMEZONES = [
  // Российские временные зоны (основные города)
  { value: 'Europe/Kaliningrad', label: 'Калининград (UTC+2)' },
  { value: 'Europe/Moscow', label: 'Москва (UTC+3)' },
  { value: 'Europe/Volgograd', label: 'Волгоград (UTC+3)' },
  { value: 'Europe/Samara', label: 'Самара (UTC+4)' },
  { value: 'Asia/Yekaterinburg', label: 'Екатеринбург (UTC+5)' },
  { value: 'Asia/Omsk', label: 'Омск (UTC+6)' },
  { value: 'Asia/Krasnoyarsk', label: 'Красноярск (UTC+7)' },
  { value: 'Asia/Novosibirsk', label: 'Новосибирск (UTC+7)' },
  { value: 'Asia/Irkutsk', label: 'Иркутск (UTC+8)' },
  { value: 'Asia/Yakutsk', label: 'Якутск (UTC+9)' },
  { value: 'Asia/Vladivostok', label: 'Владивосток (UTC+10)' },
  { value: 'Asia/Magadan', label: 'Магадан (UTC+11)' },
  { value: 'Asia/Kamchatka', label: 'Петропавловск-Камчатский (UTC+12)' },
  
  // Казахстанские временные зоны (основные города)
  { value: 'Asia/Almaty', label: 'Алматы (UTC+6)' },
  { value: 'Asia/Qyzylorda', label: 'Кызылорда (UTC+5)' },
  { value: 'Asia/Aqtobe', label: 'Актобе (UTC+5)' },
  { value: 'Asia/Aqtau', label: 'Актау (UTC+5)' },
  
  // Дополнительные зоны СНГ
  { value: 'Europe/Kiev', label: 'Киев (UTC+2)' },
  { value: 'Asia/Tashkent', label: 'Ташкент (UTC+5)' },
  { value: 'Asia/Bishkek', label: 'Бишкек (UTC+6)' },
  { value: 'Asia/Yerevan', label: 'Ереван (UTC+4)' },
  { value: 'Asia/Baku', label: 'Баку (UTC+4)' },
  { value: 'Europe/Minsk', label: 'Минск (UTC+3)' }
] as const