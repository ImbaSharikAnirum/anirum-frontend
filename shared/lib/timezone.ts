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
  // Используем сегодняшнюю дату для корректного учета DST
  const today = new Date().toISOString().split('T')[0]
  const [hours, minutes] = time.split(':').map(Number)
  
  // Создаем дату с временем в исходной зоне используя Temporal API альтернативу
  // Но пока Temporal не поддерживается везде, используем проверенный подход
  
  // Создаем UTC дату и находим разность зон
  const utcDate = new Date(`${today}T${time}:00.000Z`)
  
  // Получаем offset для обеих зон в минутах от UTC
  const sourceOffset = getTimezoneOffsetMinutes(fromTimezone, utcDate)
  const targetOffset = getTimezoneOffsetMinutes(toTimezone, utcDate) 
  
  // Вычисляем правильное UTC время исходя из локального времени источника
  const sourceUtc = new Date(utcDate.getTime() - sourceOffset * 60000)
  
  // Конвертируем в целевую зону
  const targetUtc = new Date(sourceUtc.getTime() + targetOffset * 60000)
  
  // Возвращаем в нужном формате
  const targetTime = targetUtc.toISOString().substr(11, 8)
  return targetTime + '.000'
}

/**
 * Получает offset временной зоны относительно UTC в минутах
 * Положительные значения = восточнее UTC, отрицательные = западнее
 */
function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  // Создаем formatter для получения offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset'
  })
  
  const parts = formatter.formatToParts(date)
  const offsetPart = parts.find(part => part.type === 'timeZoneName')?.value
  
  if (!offsetPart) return 0
  
  // Парсим offset формата GMT+03:00
  const match = offsetPart.match(/GMT([+-])(\d{2}):(\d{2})/)
  if (!match) return 0
  
  const sign = match[1] === '+' ? 1 : -1
  const hours = parseInt(match[2], 10)
  const minutes = parseInt(match[3], 10)
  
  return sign * (hours * 60 + minutes)
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
 * Конвертирует временной слот пользователя в московское время для фильтрации
 * @param timeSlot - временной слот ('morning', 'afternoon', 'evening')
 * @param userTimezone - часовой пояс пользователя
 * @returns объект с диапазоном времени в московской зоне
 */
export function convertTimeSlotToMoscow(
  timeSlot: 'morning' | 'afternoon' | 'evening',
  userTimezone: string
): { startTime: string, endTime: string } {
  // Определяем временные диапазоны для слотов в часовом поясе пользователя
  const timeSlots = {
    morning: { start: '09:00', end: '12:00' },
    afternoon: { start: '12:00', end: '17:00' }, 
    evening: { start: '17:00', end: '21:00' }
  }
  
  const slot = timeSlots[timeSlot]
  
  // Конвертируем начальное и конечное время в московскую зону
  const moscowStart = convertToMoscow(slot.start, userTimezone)
  const moscowEnd = convertToMoscow(slot.end, userTimezone)
  
  return {
    startTime: moscowStart.substring(0, 8), // Убираем .000
    endTime: moscowEnd.substring(0, 8)
  }
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