/**
 * Утилиты для работы с часовыми поясами
 */

/**
 * Конвертирует время из одного часового пояса в другой
 * @param time - Время в формате "HH:MM" 
 * @param fromTimezone - Исходный часовой пояс (например, "Europe/Moscow")
 * @param toTimezone - Целевой часовой пояс (например, "America/New_York")
 * @param referenceDate - Опорная дата для расчета (по умолчанию сегодня)
 * @returns Время в целевом часовом поясе в формате "HH:MM"
 */
export function convertTimeToTimezone(
  time: string,
  fromTimezone: string,
  toTimezone: string,
  referenceDate: Date = new Date()
): string {
  try {
    // Парсим время (поддерживаем как HH:MM, так и HH:MM:SS)
    const timeParts = time.split(':').map(Number)
    const [hours, minutes] = timeParts
    
    if (isNaN(hours) || isNaN(minutes)) {
      return time // Возвращаем исходное время если не удалось распарсить
    }

    // Создаем строку даты в формате ISO для исходного часового пояса
    const year = referenceDate.getFullYear()
    const month = String(referenceDate.getMonth() + 1).padStart(2, '0')
    const day = String(referenceDate.getDate()).padStart(2, '0')
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    
    // Простой способ: используем Date constructor с интерпретацией времени как локального
    // для исходного часового пояса
    const isoString = `${year}-${month}-${day}T${timeStr}`
    
    // Создаем две даты: одну как есть (будет в локальном поясе браузера), 
    // другую принудительно в исходном поясе
    const localDate = new Date(isoString)
    
    // Получаем разницу между тем, как время интерпретируется в исходном поясе
    // и в локальном поясе браузера
    const sourceDate = new Date(localDate.toLocaleString('sv-SE', { timeZone: fromTimezone }))
    const offsetMs = localDate.getTime() - sourceDate.getTime()
    
    // Корректируем изначальную дату на эту разницу
    const correctedDate = new Date(localDate.getTime() + offsetMs)
    
    // Теперь получаем время в целевом часовом поясе
    const targetTime = correctedDate.toLocaleTimeString('en-GB', {
      timeZone: toTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })

    return targetTime
  } catch (error) {
    console.warn('Failed to convert time between timezones:', error)
    return time // Возвращаем исходное время в случае ошибки
  }
}

/**
 * Получает смещение часового пояса в минутах относительно UTC
 * @param timezone - Часовой пояс (например, "Europe/Moscow")
 * @param date - Дата для расчета смещения (по умолчанию сегодня)
 * @returns Смещение в минутах
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  try {
    // Получаем время в UTC
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
    
    // Получаем время в указанном часовом поясе
    const targetTime = new Date(utcTime + (0 * 3600000))
    const localTime = new Date(targetTime.toLocaleString('en-US', { timeZone: timezone }))
    
    // Вычисляем смещение
    return (utcTime - localTime.getTime()) / 60000
  } catch (error) {
    console.warn('Failed to get timezone offset:', error)
    return 0
  }
}

/**
 * Форматирует расписание курса для отображения в пользовательском часовом поясе
 * @param startTime - Время начала в формате "HH:MM"
 * @param endTime - Время окончания в формате "HH:MM" 
 * @param courseTimezone - Часовой пояс курса
 * @param userTimezone - Часовой пояс пользователя
 * @returns Объект с отформатированным расписанием
 */
export function formatCourseSchedule(
  startTime: string,
  endTime: string,
  courseTimezone: string,
  userTimezone: string
) {
  // Если часовые пояса одинаковые, возвращаем как есть
  if (courseTimezone === userTimezone) {
    return {
      timeRange: `${startTime} - ${endTime}`,
      timezone: courseTimezone,
      isConverted: false
    }
  }

  // Конвертируем время в пользовательский часовой пояс
  const convertedStartTime = convertTimeToTimezone(startTime, courseTimezone, userTimezone)
  const convertedEndTime = convertTimeToTimezone(endTime, courseTimezone, userTimezone)

  return {
    timeRange: `${convertedStartTime} - ${convertedEndTime}`,
    timezone: userTimezone,
    originalTimeRange: `${startTime} - ${endTime}`,
    originalTimezone: courseTimezone,
    isConverted: true
  }
}

/**
 * Получает аббревиатуру часового пояса
 * @param timezone - Полное название часового пояса
 * @param date - Дата для определения аббревиатуры (по умолчанию сегодня)
 * @returns Аббревиатура часового пояса
 */
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'short'
    })
    
    const parts = formatter.formatToParts(date)
    const abbreviation = parts.find(part => part.type === 'timeZoneName')?.value
    
    return abbreviation || timezone
  } catch (error) {
    console.warn('Failed to get timezone abbreviation:', error)
    return timezone
  }
}

/**
 * Проверяет, является ли строка валидным часовым поясом
 * @param timezone - Строка с часовым поясом
 * @returns true если часовой пояс валидный
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}