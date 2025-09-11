import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Курсы по анимации и геймдев - Anirum',
  description: 'Подберите расписание и запишитесь на курс! Онлайн и офлайн обучение от экспертов индустрии',
  openGraph: {
    title: 'Курсы по анимации и геймдев - Anirum',
    description: 'Подберите расписание и запишитесь на курс! Онлайн и офлайн обучение от экспертов индустрии',
    url: 'https://anirum.com/courses',
    siteName: 'Anirum',
    images: [
      {
        url: '/og-courses.jpg',
        width: 1200,
        height: 630,
        alt: 'Курсы по анимации и геймдев на Anirum',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Курсы по анимации и геймдев - Anirum',
    description: 'Подберите расписание и запишитесь на курс! Онлайн и офлайн обучение от экспертов индустрии',
    images: ['/og-courses.jpg'],
  },
}

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}