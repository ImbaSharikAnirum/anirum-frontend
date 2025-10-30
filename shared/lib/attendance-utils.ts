/**
 * Утилиты для работы с посещаемостью
 */

interface AttendanceDay {
  date: Date
  dayName: string
  isToday: boolean
  isPast: boolean
  isFuture: boolean
}

const WEEKDAY_MAPPING = {
  'monday': 1,
  'tuesday': 2, 
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6,
  'sunday': 0
}

const WEEKDAY_NAMES_RU = {
  'monday': 'Понедельник',
  'tuesday': 'Вторник',
  'wednesday': 'Среда', 
  'thursday': 'Четверг',
  'friday': 'Пятница',
  'saturday': 'Суббота',
  'sunday': 'Воскресенье'
}

/**
 * Генерирует список дат занятий на основе дней недели и периода курса
 */
export function generateCourseDates(
  startDate: string,
  endDate: string,
  weekdays: string[]
): AttendanceDay[] {
  // Парсим даты БЕЗ timezone (локальное время)
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
  const start = new Date(startYear, startMonth - 1, startDay)
  const end = new Date(endYear, endMonth - 1, endDay)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const courseDates: AttendanceDay[] = []

  // Получаем номера дней недели из массива
  const weekdayNumbers = weekdays.map(day => WEEKDAY_MAPPING[day as keyof typeof WEEKDAY_MAPPING])

  // Итерируемся по каждому дню в диапазоне
  const current = new Date(start)
  while (current <= end) {
    const dayOfWeek = current.getDay()

    // Если этот день недели входит в расписание курса
    if (weekdayNumbers.includes(dayOfWeek)) {
      const dateForComparison = new Date(current)
      dateForComparison.setHours(0, 0, 0, 0)

      courseDates.push({
        date: new Date(current),
        dayName: WEEKDAY_NAMES_RU[weekdays.find(day => WEEKDAY_MAPPING[day as keyof typeof WEEKDAY_MAPPING] === dayOfWeek) as keyof typeof WEEKDAY_NAMES_RU] || '',
        isToday: dateForComparison.getTime() === today.getTime(),
        isPast: dateForComparison < today,
        isFuture: dateForComparison > today
      })
    }

    // Переходим к следующему дню
    current.setDate(current.getDate() + 1)
  }

  return courseDates
}

/**
 * Форматирует дату для отображения
 */
export function formatAttendanceDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit'
  })
}

/**
 * Получает статус посещения (заглушка для будущего API)
 */
export function getAttendanceStatus(studentId: string, date: Date): 'present' | 'absent' | 'unknown' {
  // TODO: Здесь будет запрос к API для получения статуса посещения
  return 'unknown'
}

/**
 * Обновляет статус посещения (заглушка для будущего API)
 */
export async function updateAttendanceStatus(
  studentId: string, 
  date: Date, 
  status: 'present' | 'absent'
): Promise<void> {
  // TODO: Здесь будет запрос к API для обновления статуса
  console.log('Update attendance:', { studentId, date, status })
}