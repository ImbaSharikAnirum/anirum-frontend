'use client'

import { Shield, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AccessDeniedProps {
  title?: string
  message?: string
  showBackButton?: boolean
  showHomeButton?: boolean
  className?: string
}

/**
 * Глобальный компонент для отображения отказа в доступе
 * @layer shared/ui
 */
export function AccessDenied({
  title = 'Доступ запрещен',
  message = 'У вас нет прав для просмотра этой страницы',
  showBackButton = true,
  showHomeButton = true,
  className = ''
}: AccessDeniedProps) {
  const router = useRouter()

  return (
    <div className={`flex flex-col items-center justify-center min-h-[60vh] px-4 ${className}`}>
      <div className="text-center max-w-md">
        {/* Иконка */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>

        {/* Заголовок */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h1>

        {/* Сообщение */}
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Главная
            </button>
          )}
        </div>
      </div>
    </div>
  )
}