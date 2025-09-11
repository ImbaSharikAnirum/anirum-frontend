import type { Metadata } from 'next'
import { courseAPI } from '@/entities/course'

// Функция для форматирования дней недели
function formatWeekdays(weekdays: string[]): string {
  const dayNames: Record<string, string> = {
    'monday': 'Пн',
    'tuesday': 'Вт', 
    'wednesday': 'Ср',
    'thursday': 'Чт',
    'friday': 'Пт',
    'saturday': 'Сб',
    'sunday': 'Вс'
  }
  
  return weekdays.map(day => dayNames[day] || day).join(', ')
}

// Функция для форматирования направления
function formatDirection(direction: string): string {
  const directions: Record<string, string> = {
    'sketching': 'Скетчинг',
    'drawing2d': '2D рисование',
    'animation': 'Анимация',
    'modeling3d': '3D моделирование'
  }
  
  return directions[direction] || direction
}

// Функция для форматирования времени
function formatTime(startTime: string, endTime: string, timezone: string): string {
  return `${startTime}-${endTime} (${timezone})`
}

export async function generateMetadata({ params }: { params: Promise<{ courseId: string }> }): Promise<Metadata> {
  try {
    const { courseId } = await params
    const course = await courseAPI.getCourse(courseId, ['teacher.avatar', 'images'])
    
    if (!course) {
      return {
        title: 'Курс не найден - Anirum',
        description: 'Запрашиваемый курс не найден'
      }
    }

    // Формируем детальное описание с ключевой информацией
    const timeInfo = formatTime(course.startTime, course.endTime, course.timezone)
    const weekdaysInfo = formatWeekdays(course.weekdays)
    const directionInfo = formatDirection(course.direction)
    const locationInfo = course.isOnline ? 'Онлайн' : `${course.city}, ${course.address}`
    
    const description = `${directionInfo} • ${timeInfo} • ${weekdaysInfo} • ${locationInfo} • От ${course.pricePerLesson}₽/урок`
    
    const title = `${directionInfo} - ${course.city} ${course.isOnline ? '(Онлайн)' : ''} | Anirum`

    // Выбираем изображение курса или дефолтное
    const courseImage = course.images && course.images.length > 0 
      ? (typeof course.images[0] === 'string' ? course.images[0] : course.images[0].url)
      : '/og-course-default.jpg'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://anirum.com/courses/${courseId}`,
        siteName: 'Anirum',
        images: [
          {
            url: courseImage,
            width: 1200,
            height: 630,
            alt: `${directionInfo} в ${course.city}${course.isOnline ? ' (Онлайн)' : ''}`,
          },
        ],
        locale: 'ru_RU',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [courseImage],
      },
      other: {
        // Дополнительные теги для поисковых систем
        'course:direction': directionInfo,
        'course:time': timeInfo,
        'course:days': weekdaysInfo,
        'course:location': locationInfo,
        'course:price': `${course.pricePerLesson}₽`,
        'course:format': course.isOnline ? 'online' : 'offline',
        'course:city': course.city,
        'course:country': course.country,
      }
    }
  } catch (error) {
    console.error('Error generating course metadata:', error)
    
    return {
      title: 'Курс - Anirum',
      description: 'Изучайте анимацию и геймдев на нашей платформе',
      openGraph: {
        title: 'Курс - Anirum',
        description: 'Изучайте анимацию и геймдев на нашей платформе',
        images: ['/og-course-default.jpg'],
      },
    }
  }
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return children
}