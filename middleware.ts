import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Защищенные роуты
const protectedRoutes = [
  '/dashboard',
  '/courses/create',
  '/settings'
]

// Роуты только для гостей
const guestOnlyRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password'
]

// Роуты для ролей
const roleBasedRoutes = {
  manager: [
    '/dashboard/manager'
  ],
  teacher: [
    '/dashboard/teacher'
  ]
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('session')

  // Для защищенных роутов
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!sessionCookie) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Для роутов только для гостей
  if (guestOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Проверка ролей будет выполняться на уровне компонентов,
  // так как здесь у нас нет доступа к данным пользователя

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}