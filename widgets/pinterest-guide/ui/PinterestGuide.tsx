'use client'

/**
 * Pinterest Guide Viewer - отображение пина как гайда
 * Поддерживает navigation state и fallback API запросы
 * @layer widgets
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft, Share2, Upload } from 'lucide-react'
import { pinterestAPI, type PinterestPin } from '@/entities/pinterest'
import { creationAPI } from '@/entities/creation'
import { ImageUploadDialog } from '@/shared/ui'
import type { User } from '@/entities/user/model/types'

interface PinterestGuideProps {
  pinId: string
  user: User | null
}

export function PinterestGuide({ pinId, user }: PinterestGuideProps) {
  const router = useRouter()

  // Синхронная проверка navigation state и sessionStorage при инициализации
  const [pin, setPin] = useState<PinterestPin | null>(() => {
    if (typeof window !== 'undefined') {
      // Приоритет 1: navigation state (переход из галереи)
      const navigationState = window.history.state?.pinData
      if (navigationState?.id === pinId) {
        return navigationState
      }

      // Приоритет 2: sessionStorage кеш (возврат или прямой переход)
      try {
        const cached = sessionStorage.getItem(`pinterest-pin-${pinId}`)
        if (cached) {
          const cachedPin = JSON.parse(cached)
          return cachedPin
        }
      } catch (error) {
        console.error('Ошибка чтения кеша:', error)
      }
    }
    return null
  })

  // Loading только если нет данных ни из navigation state, ни из кеша
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      // Проверяем navigation state
      const navigationState = window.history.state?.pinData
      if (navigationState?.id === pinId) return false

      // Проверяем sessionStorage
      try {
        const cached = sessionStorage.getItem(`pinterest-pin-${pinId}`)
        if (cached) return false
      } catch (error) {
        // Ошибка чтения кеша
      }
    }
    return true
  })

  const [error, setError] = useState<string | null>(null)

  // Состояние для диалога загрузки изображения
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // API запрос только если данных нет в state
  useEffect(() => {
    // Если данные уже есть (из navigation state), ничего не делаем
    if (pin) return

    const loadPinData = async () => {
      try {
        setError(null)
        setLoading(true)

        const pinData = await pinterestAPI.getPinById(pinId)

        if (pinData) {
          setPin(pinData)

          // Кешируем загруженный пин для будущих переходов
          try {
            sessionStorage.setItem(`pinterest-pin-${pinData.id}`, JSON.stringify(pinData))
          } catch (error) {
            console.error('Ошибка сохранения пина в кеш после загрузки:', error)
          }
        } else {
          setError('Пин не найден. Возможно, он был удален или недоступен.')
        }

      } catch (err) {
        console.error('Ошибка загрузки пина:', err)
        const message = err instanceof Error ? err.message : 'Не удалось загрузить пин'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadPinData()
  }, [pinId, pin])

  const handleBack = () => {
    // Кешируем текущий пин для потенциального возврата
    if (pin) {
      try {
        sessionStorage.setItem(`pinterest-pin-${pin.id}`, JSON.stringify(pin))
      } catch (error) {
        console.error('Ошибка сохранения пина в кеш:', error)
      }
    }

    // Переходим конкретно к Pinterest разделу
    router.push('/guides#pinterest')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pin?.title || 'Pinterest Pin',
          text: pin?.description || '',
          url: window.location.href,
        })
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('Не удалось поделиться')
        }
      }
    } else {
      // Fallback: копирование в буфер обмена
      navigator.clipboard.writeText(window.location.href)
      toast.success('Ссылка скопирована в буфер обмена')
    }
  }

  const handleUploadImage = async (file: File) => {
    if (!pin || !user) {
      toast.error('Необходимо войти в систему')
      return
    }

    try {
      setIsUploading(true)

      // Загрузка через creationAPI
      await creationAPI.uploadCreation(file, pin)

      toast.success('Изображение успешно загружено и сохранено как гайд!')
      setShowUploadDialog(false)
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      const message = error instanceof Error ? error.message : 'Не удалось загрузить изображение'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header с кнопками */}
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex gap-8">
          {/* Изображение */}
          <div className="flex-1 max-w-2xl">
            <Skeleton className="w-full h-[600px] rounded-lg" />
          </div>

          {/* Информация */}
          <div className="flex-1 max-w-md space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-20" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          <Skeleton className="w-full h-[400px] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !pin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Пин не найден</h1>
          <p className="text-gray-600">{error || 'Не удалось загрузить данные пина'}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться назад
          </Button>
        </div>
      </div>
    )
  }

  const imageUrl = pin.media?.images?.['1200x']?.url ||
                  pin.media?.images?.['736x']?.url ||
                  Object.values(pin.media?.images || {})[0]?.url

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header с кнопками */}
      <div className="flex items-center justify-between mb-8">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <div className="flex gap-2">
          {user && (
            <Button onClick={() => setShowUploadDialog(true)} variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Загрузить изображение
            </Button>
          )}
          <Button onClick={handleShare} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Поделиться
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex gap-8">
        {/* Изображение */}
        <div className="flex-shrink-0">
          <img
            src={imageUrl}
            alt={pin.title || 'Pinterest pin'}
            className="max-w-lg max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Информация */}
        <div className="flex-1 max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {pin.title || 'Pinterest Pin'}
            </h1>
            {pin.description && (
              <p className="text-gray-600 leading-relaxed">
                {pin.description}
              </p>
            )}
          </div>

          {pin.link && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Источник</h3>
              <a
                href={pin.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {pin.link}
              </a>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Теги</h3>
            <div className="flex flex-wrap gap-2">
              {/* TODO: Добавить теги когда они будут доступны */}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                pinterest
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                гайд
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        <div className="relative flex justify-center">
          <img
            src={imageUrl}
            alt={pin.title || 'Pinterest pin'}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              {pin.title || 'Pinterest Pin'}
            </h1>
            {pin.description && (
              <p className="text-gray-600 leading-relaxed">
                {pin.description}
              </p>
            )}
          </div>

          {pin.link && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Источник</h3>
              <a
                href={pin.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all text-sm"
              >
                {pin.link}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Диалог загрузки изображения */}
      <ImageUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={handleUploadImage}
        isUploading={isUploading}
        pinTitle={pin.title}
      />
    </div>
  )
}