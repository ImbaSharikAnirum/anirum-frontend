'use client'

/**
 * Виджет отображения моих креативов по гайду
 * @layer widgets
 */

import { useState, useEffect } from 'react'
import { Image, Upload } from 'lucide-react'
import { creationAPI, type Creation } from '@/entities/creation'
import type { User } from '@/entities/user/model/types'

interface MyGuideCreationsProps {
  guideId: string
  user: User | null
}

export function MyGuideCreations({ guideId, user }: MyGuideCreationsProps) {
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCreations = async () => {
      if (!user?.documentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await creationAPI.getMyCreationsByGuide(guideId, user.documentId)
        setCreations(response.data || [])
      } catch (err) {
        console.error('Ошибка загрузки моих креативов:', err)
        setError('Не удалось загрузить креативы')
      } finally {
        setLoading(false)
      }
    }

    if (guideId && user?.documentId) {
      fetchCreations()
    } else {
      setLoading(false)
    }
  }, [guideId, user?.documentId])

  // Если пользователь не авторизован - не показываем виджет
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="py-8 border-b border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64 space-y-2">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 border-b border-gray-200">
        <div className="text-center text-red-500">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (creations.length === 0) {
    return (
      <div className="py-8 border-b border-gray-200">
        <div className="text-center">
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Мои креативы по этому гайду
          </h3>
          <p className="text-sm text-gray-600">
            У вас пока нет загруженных креативов по этому гайду
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 border-b border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Мои креативы ({creations.length})
      </h2>

      {/* Горизонтальный скролл */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4">
          {creations.map((creation) => (
            <div
              key={creation.documentId}
              className="flex-shrink-0 w-64 cursor-pointer group"
              onClick={() => window.location.href = `/creations/${creation.documentId}`}
            >
              {/* Изображение */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:shadow-lg transition-shadow mb-2">
                <img
                  src={creation.image.url}
                  alt={`Мой креатив ${creation.documentId}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Дата под изображением */}
              <p className="text-sm text-gray-500 text-left">
                {new Date(creation.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
