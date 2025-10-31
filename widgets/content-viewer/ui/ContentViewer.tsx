'use client'

/**
 * Универсальный просмотрщик контента (пины и гайды)
 * Поддерживает navigation state и fallback API запросы
 * @layer widgets/content-viewer
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft, Share2, Upload, PictureInPicture2 } from 'lucide-react'
import { pinterestAPI, type PinterestPin } from '@/entities/pinterest'
import { guideAPI, type Guide } from '@/entities/guide'
import { creationAPI } from '@/entities/creation'
import { ImageUploadDialog } from '@/shared/ui'
import type { User } from '@/entities/user/model/types'
import type { ContentType } from '../model/types'
import { adaptToUnified } from '../lib/adapters'

interface ContentViewerProps {
  type: ContentType
  id: string
  user: User | null
}

type ContentItem = Guide | PinterestPin

export function ContentViewer({ type, id, user }: ContentViewerProps) {
  const router = useRouter()

  // Флаг монтирования для предотвращения hydration mismatch
  const [mounted, setMounted] = useState(false)

  // Ключи для state и storage
  const stateKey = type === 'pin' ? 'pinData' : 'guideData'
  const storageKey = `${type}-${id}`

  // Умная загрузка данных с приоритетами (только после монтирования)
  const [content, setContent] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPipSupported, setIsPipSupported] = useState(false)

  // Проверка поддержки Picture-in-Picture
  useEffect(() => {
    setIsPipSupported(
      'documentPictureInPicture' in window || typeof window !== 'undefined'
    )
  }, [])

  // Устанавливаем флаг монтирования и проверяем кеш
  useEffect(() => {
    setMounted(true)

    // Проверяем кеш после монтирования
    // Приоритет 1: navigation state
    const navigationState = window.history.state?.[stateKey]
    if (navigationState?.id === id || navigationState?.documentId === id) {
      setContent(navigationState)
      setLoading(false)
      return
    }

    // Приоритет 2: sessionStorage
    try {
      const cached = sessionStorage.getItem(storageKey)
      if (cached) {
        setContent(JSON.parse(cached))
        setLoading(false)
        return
      }
    } catch (error) {
      console.error('Ошибка чтения кеша:', error)
    }
  }, [])

  // API запрос только если данных нет
  useEffect(() => {
    if (content || !mounted) return

    const loadContent = async () => {
      try {
        setError(null)

        let data: ContentItem | null = null

        if (type === 'pin') {
          data = await pinterestAPI.getPinById(id)
        } else {
          const response = await guideAPI.getGuide(id)
          data = response.data
        }

        if (data) {
          setContent(data)
          try {
            sessionStorage.setItem(storageKey, JSON.stringify(data))
          } catch (error) {
            console.error('Ошибка сохранения в кеш:', error)
          }
        } else {
          setError(`${type === 'pin' ? 'Пин' : 'Гайд'} не найден`)
        }
      } catch (err) {
        console.error('Ошибка загрузки контента:', err)
        const message = err instanceof Error ? err.message : 'Не удалось загрузить данные'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [type, id, content, storageKey, mounted])

  const handleBack = () => {
    if (content) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(content))
      } catch (error) {
        console.error('Ошибка сохранения в кеш:', error)
      }
    }

    // Используем router.back() для сохранения состояния галереи
    router.back()
  }

  const handleShare = async () => {
    const unified = content ? adaptToUnified(content, type) : null

    if (navigator.share && unified) {
      try {
        await navigator.share({
          title: unified.title,
          text: unified.description || '',
          url: window.location.href,
        })
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          toast.error('Не удалось поделиться')
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Ссылка скопирована в буфер обмена')
    }
  }

  const handleUploadImage = async (file: File) => {
    if (!content || !user) {
      toast.error('Необходимо войти в систему')
      return
    }

    try {
      setIsUploading(true)

      if (type === 'pin') {
        await creationAPI.uploadCreation(file, content as PinterestPin)
      } else {
        // Для гайдов тоже можно загружать креативы
        await creationAPI.uploadCreation(file, content as any)
      }

      toast.success('Изображение успешно загружено!')
      setShowUploadDialog(false)
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      const message = error instanceof Error ? error.message : 'Не удалось загрузить изображение'
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handlePictureInPicture = async () => {
    if (!content) return

    const unified = adaptToUnified(content, type)

    try {
      // Проверяем поддержку Document Picture-in-Picture API
      if ('documentPictureInPicture' in window) {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 600,
          height: 400,
        })

        // Копируем стили в PiP окно
        const styles = Array.from(document.styleSheets)
          .map(sheet => {
            try {
              return Array.from(sheet.cssRules)
                .map(rule => rule.cssText)
                .join('\n')
            } catch {
              return ''
            }
          })
          .join('\n')

        const styleElement = pipWindow.document.createElement('style')
        styleElement.textContent = styles
        pipWindow.document.head.appendChild(styleElement)

        // Создаём контейнер для изображения
        const container = pipWindow.document.createElement('div')
        container.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          padding: 16px;
        `

        const img = pipWindow.document.createElement('img')
        img.src = unified.imageUrl
        img.alt = unified.title
        img.style.cssText = `
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        `

        container.appendChild(img)
        pipWindow.document.body.appendChild(container)

        toast.success('Изображение открыто в режиме Picture-in-Picture')
      } else {
        // Fallback: открываем в новом окне
        const width = 600
        const height = 400
        const left = window.screen.width - width - 50
        const top = 50

        const pipWindow = window.open(
          '',
          'PiP',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
        )

        if (pipWindow) {
          pipWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${unified.title}</title>
                <style>
                  body {
                    margin: 0;
                    padding: 16px;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                  }
                  img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                  }
                </style>
              </head>
              <body>
                <img src="${unified.imageUrl}" alt="${unified.title}" />
              </body>
            </html>
          `)
          pipWindow.document.close()
          toast.success('Изображение открыто в отдельном окне')
        } else {
          toast.error('Не удалось открыть окно. Проверьте настройки браузера.')
        }
      }
    } catch (error) {
      console.error('Ошибка открытия Picture-in-Picture:', error)
      const message = error instanceof Error ? error.message : 'Не удалось открыть Picture-in-Picture'
      toast.error(message)
    }
  }

  if (loading) {
    return <ContentSkeleton />
  }

  if (error || !content) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {type === 'pin' ? 'Пин не найден' : 'Гайд не найден'}
          </h1>
          <p className="text-gray-600">{error || 'Не удалось загрузить данные'}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться назад
          </Button>
        </div>
      </div>
    )
  }

  const unified = adaptToUnified(content, type)

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <div className="flex gap-2">
          {user && (
            <Button onClick={() => setShowUploadDialog(true)} variant="outline" size="sm" className="hidden md:flex">
              <Upload className="w-4 h-4 mr-2" />
              Загрузить свой креатив по {type === 'pin' ? 'пину' : 'гайду'}
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
        <div className="flex-shrink-0 relative group">
          <img
            src={unified.imageUrl}
            alt={unified.title}
            className="max-w-lg max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
          {/* PiP кнопка в углу изображения */}
          {isPipSupported && (
            <button
              onClick={handlePictureInPicture}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm"
              title="Открыть в Picture-in-Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{unified.title}</h1>
            {unified.description && (
              <p className="text-gray-600 leading-relaxed">{unified.description}</p>
            )}
          </div>

          {unified.link && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Источник</h3>
              <a
                href={unified.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {unified.link}
              </a>
            </div>
          )}

          {unified.tags && unified.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Теги</h3>
              <div className="flex flex-wrap gap-2">
                {unified.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        <div className="relative flex justify-center group">
          <img
            src={unified.imageUrl}
            alt={unified.title}
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
          {/* PiP кнопка в углу изображения (mobile) */}
          {isPipSupported && (
            <button
              onClick={handlePictureInPicture}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 active:bg-black/90 text-white rounded-lg backdrop-blur-sm"
              title="Открыть в Picture-in-Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Кнопка загрузки изображения в мобильной версии */}
        {user && (
          <Button
            onClick={() => setShowUploadDialog(true)}
            variant="outline"
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Загрузить свой креатив по {type === 'pin' ? 'пину' : 'гайду'}
          </Button>
        )}

        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{unified.title}</h1>
            {unified.description && (
              <p className="text-gray-600 leading-relaxed">{unified.description}</p>
            )}
          </div>

          {unified.link && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Источник</h3>
              <a
                href={unified.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all text-sm"
              >
                {unified.link}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <ImageUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUpload={handleUploadImage}
        isUploading={isUploading}
        pinTitle={unified.title}
      />
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>

      <div className="hidden md:flex gap-8">
        <div className="flex-1 max-w-2xl">
          <Skeleton className="w-full h-[600px] rounded-lg" />
        </div>
        <div className="flex-1 max-w-md space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <div className="md:hidden space-y-6">
        <Skeleton className="w-full h-[400px] rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    </div>
  )
}
