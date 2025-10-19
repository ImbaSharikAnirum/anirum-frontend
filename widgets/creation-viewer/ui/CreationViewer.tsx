'use client'

/**
 * Просмотрщик креатива в стиле ArtStation (светлая тема)
 * @layer widgets/creation-viewer
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, ExternalLink, Calendar, Image as ImageIcon } from 'lucide-react'
import { creationAPI, type Creation } from '@/entities/creation'

interface CreationViewerProps {
  creationId: string
}

export function CreationViewer({ creationId }: CreationViewerProps) {
  const router = useRouter()
  const [creation, setCreation] = useState<Creation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCreation = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await creationAPI.getCreationById(creationId)
        setCreation(response.data)
      } catch (err) {
        console.error('Ошибка загрузки креатива:', err)
        setError('Не удалось загрузить креатив')
      } finally {
        setLoading(false)
      }
    }

    if (creationId) {
      loadCreation()
    }
  }, [creationId])

  if (loading) {
    return <CreationSkeleton />
  }

  if (error || !creation) {
    return (
      <div className="bg-gray-50 flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="text-center space-y-4">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-900">Креатив не найден</h1>
          <p className="text-gray-600">{error || 'Не удалось загрузить данные'}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться назад
          </Button>
        </div>
      </div>
    )
  }

  const imageUrl = creation.image?.formats?.large?.url || creation.image?.url
  const createdDate = new Date(creation.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left side with back button and image */}
        <div className="flex-1 flex flex-col py-8 min-h-0">
          {/* Back Button */}
          <div className="px-4 sm:px-6 md:px-8 mb-8 flex-shrink-0">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>

          {/* Image - Center */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 min-h-0">
            <img
              src={imageUrl}
              alt="Креатив"
              className="max-w-full max-h-full w-auto h-auto rounded-lg object-contain"
            />
          </div>
        </div>

        {/* Author Info - Right Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white h-full p-6 space-y-6 lg:sticky lg:top-0 overflow-y-auto">
            {/* Author */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {creation.users_permissions_user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500">Автор</p>
                  <Link
                    href={`/profile/${creation.users_permissions_user.documentId}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    @{creation.users_permissions_user.username}
                  </Link>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{createdDate}</span>
              </div>
            </div>

            {/* Source Guide */}
            {creation.guide && (
              <div className="pt-6 border-t border-gray-200 space-y-3">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Исходный гайд
                </p>
                <Link
                  href={`/guides/${creation.guide.documentId}`}
                  className="block group"
                >
                  {/* Guide Image */}
                  {creation.guide.image?.url && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={creation.guide.image.url}
                        alt={creation.guide.title}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <h3 className="font-semibold text-gray-900 mb-2">
                    {creation.guide.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-900">
                    <span>Перейти к гайду</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CreationSkeleton() {
  return (
    <div className="bg-gray-50" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex flex-col lg:flex-row h-full">
        <div className="flex-1 flex flex-col py-8 min-h-0">
          <div className="px-4 sm:px-6 md:px-8 mb-8 flex-shrink-0">
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 min-h-0">
            <Skeleton className="w-full max-w-4xl h-full rounded-lg" />
          </div>
        </div>
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="bg-white h-full p-6 space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
