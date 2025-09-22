'use client'

/**
 * Pinterest галерея с Masonry layout и infinite scroll
 * @layer widgets
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Heart, Download } from 'lucide-react'
import { pinterestAPI, type PinterestPin } from '@/entities/pinterest'
import type { User } from '@/entities/user/model/types'

interface PinterestGalleryProps {
  user: User
}

export function PinterestGallery({ user }: PinterestGalleryProps) {
  const [pins, setPins] = useState<PinterestPin[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [bookmark, setBookmark] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [savingPins, setSavingPins] = useState<Set<string>>(new Set())

  const pageSize = 50

  // Начинаем с 2 колонок по умолчанию для SSR (mobile-first)
  const [columnsCount, setColumnsCount] = useState(2)

  // Определяем количество колонок только на клиенте
  useEffect(() => {
    const getColumnsCount = () => {
      const width = window.innerWidth
      if (width >= 1536) return 7 // 2xl
      if (width >= 1280) return 6 // xl
      if (width >= 1024) return 5 // lg
      if (width >= 768) return 3  // md
      if (width >= 640) return 2  // sm
      return 2 // xs (320px и меньше) - гарантированно 2 колонки
    }

    const handleResize = () => {
      setColumnsCount(getColumnsCount())
    }

    // Устанавливаем правильное количество колонок после гидратации
    setColumnsCount(getColumnsCount())

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Создаем masonry колонки
  const masonryColumns = useMemo(() => {
    const columns: PinterestPin[][] = Array.from({ length: columnsCount }, () => [])

    pins.forEach((pin, index) => {
      const columnIndex = index % columnsCount
      columns[columnIndex].push(pin)
    })

    return columns
  }, [pins, columnsCount])

  // Загрузка первой страницы пинов
  const loadInitialPins = useCallback(async () => {
    try {
      setLoading(true)
      const response = await pinterestAPI.getPins({ pageSize })

      setPins(response.items)
      setBookmark(response.bookmark || null)
      setHasMore(!!response.bookmark)
    } catch (error) {
      console.error('Ошибка загрузки пинов:', error)
      toast.error('Не удалось загрузить пины')
    } finally {
      setLoading(false)
    }
  }, [])

  // Загрузка дополнительных пинов
  const loadMorePins = useCallback(async () => {
    if (!hasMore || !bookmark || loadingMore) return

    try {
      setLoadingMore(true)
      const response = await pinterestAPI.getPins({ pageSize, bookmark })

      setPins(prev => [...prev, ...response.items])
      setBookmark(response.bookmark || null)
      setHasMore(!!response.bookmark)
    } catch (error) {
      console.error('Ошибка загрузки дополнительных пинов:', error)
      toast.error('Не удалось загрузить больше пинов')
    } finally {
      setLoadingMore(false)
    }
  }, [bookmark, hasMore, loadingMore])

  // Инициализация
  useEffect(() => {
    loadInitialPins()
  }, [loadInitialPins])

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMorePins()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMorePins])


  // Сохранение пина как гайда
  const handleSavePin = async (pin: PinterestPin) => {
    if (savingPins.has(pin.id) || pin.isSaved) {
      return
    }

    try {
      setSavingPins(prev => new Set(prev).add(pin.id))

      const imageUrl = pin.media?.images?.['1200x']?.url ||
                      pin.media?.images?.['736x']?.url ||
                      Object.values(pin.media?.images || {})[0]?.url

      if (!imageUrl) {
        throw new Error('Изображение недоступно')
      }

      await pinterestAPI.savePinAsGuide({
        imageUrl,
        title: pin.title || 'Pinterest Pin',
        text: pin.description || '',
        link: pin.link,
        tags: [],
        approved: false, // Всегда требует модерации
      })

      // Обновляем статус пина
      setPins(prev => prev.map(p =>
        p.id === pin.id ? { ...p, isSaved: true } : p
      ))

      toast.success('Пин сохранен как гайд!')
    } catch (error) {
      console.error('Ошибка сохранения пина:', error)
      toast.error('Не удалось сохранить пин')
    } finally {
      setSavingPins(prev => {
        const newSet = new Set(prev)
        newSet.delete(pin.id)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 md:gap-4">
          {Array.from({ length: columnsCount }).map((_, columnIndex) => (
            <div key={columnIndex} className="flex-1 min-w-0 space-y-2 md:space-y-4">
              {Array.from({ length: Math.ceil(20 / columnsCount) }).map((_, i) => {
                // Детерминированные высоты для предотвращения hydration mismatch
                const heights = [280, 320, 240, 360, 300, 220, 380, 260, 340, 290, 250, 310, 270, 350, 230, 330, 280, 370, 240, 320]
                const skeletonIndex = columnIndex * Math.ceil(20 / columnsCount) + i
                return (
                  <Skeleton
                    key={i}
                    className="rounded-lg"
                    style={{ height: heights[skeletonIndex % heights.length] }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Masonry Grid */}
      <div className="flex gap-2 md:gap-4">
        {masonryColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex-1 min-w-0 space-y-2 md:space-y-4">
            {/* Существующие пины */}
            {column.map(pin => {
              const imageUrl = pin.media?.images?.['736x']?.url ||
                              pin.media?.images?.['1200x']?.url ||
                              Object.values(pin.media?.images || {})[0]?.url

              if (!imageUrl) return null

              const isSaving = savingPins.has(pin.id)

              return (
                <div
                  key={pin.id}
                  className="group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow w-full max-w-full"
                >
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={pin.title || 'Pinterest pin'}
                      className="w-full h-auto max-w-full object-cover"
                      loading="lazy"
                    />

                    {/* Overlay с кнопками */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSavePin(pin)}
                          disabled={isSaving || pin.isSaved}
                          className="bg-white text-black hover:bg-gray-100"
                        >
                          {isSaving ? (
                            'Сохраняю...'
                          ) : pin.isSaved ? (
                            <>
                              <Heart className="w-4 h-4 mr-1 fill-current" />
                              Сохранено
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-1" />
                              Сохранить
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                </div>
              )
            })}

            {/* Скелетоны загрузки в конце каждой колонки */}
            {loadingMore && (
              <>
                {Array.from({ length: Math.ceil(pageSize / columnsCount / 3) }).map((_, i) => {
                  // Детерминированные высоты для предотвращения hydration mismatch
                  const heights = [280, 320, 240, 360, 300, 220, 380, 260, 340, 290, 250, 310, 270, 350, 230]
                  const skeletonIndex = columnIndex * Math.ceil(pageSize / columnsCount / 3) + i
                  return (
                    <Skeleton
                      key={`loading-${columnIndex}-${i}`}
                      className="rounded-lg animate-pulse bg-gray-200"
                      style={{ height: heights[skeletonIndex % heights.length] }}
                    />
                  )
                })}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Конец списка */}
      {!hasMore && pins.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Все пины загружены</p>
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && pins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">У вас пока нет пинов</p>
          <p className="text-gray-400 mt-2">
            Создайте пины в Pinterest, чтобы они появились здесь
          </p>
        </div>
      )}
    </div>
  )
}