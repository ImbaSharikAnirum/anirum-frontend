'use client'

/**
 * Pinterest галерея с Masonry layout и infinite scroll
 * @layer widgets
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { pinterestAPI, type PinterestPin } from '@/entities/pinterest'
import type { User } from '@/entities/user/model/types'

interface PinterestGalleryProps {
  user: User
}

export function PinterestGallery({}: PinterestGalleryProps) {
  const router = useRouter()

  // Инициализация с проверкой кеша
  const [pins, setPins] = useState<PinterestPin[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('pinterest-pins-cache')
        if (cached) {
          const cachedData = JSON.parse(cached)
          return cachedData.pins || []
        }
      } catch (error) {
        // Ошибка чтения кеша пинов
      }
    }
    return []
  })

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('pinterest-pins-cache')
        if (cached) {
          const cachedData = JSON.parse(cached)
          return !cachedData.pins || cachedData.pins.length === 0
        }
      } catch (error) {
        // Ошибка проверки кеша для loading
      }
    }
    return true
  })

  const [loadingMore, setLoadingMore] = useState(false)

  const [bookmark, setBookmark] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('pinterest-pins-cache')
        if (cached) {
          const cachedData = JSON.parse(cached)
          return cachedData.bookmark || null
        }
      } catch (error) {
        // Ошибка чтения bookmark из кеша
      }
    }
    return null
  })

  const [hasMore, setHasMore] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem('pinterest-pins-cache')
        if (cached) {
          const cachedData = JSON.parse(cached)
          return cachedData.hasMore !== false
        }
      } catch (error) {
        // Ошибка чтения hasMore из кеша
      }
    }
    return true
  })

  const pageSize = 50

  // Функция сохранения состояния в кеш
  const saveToCache = useCallback((pinsData: PinterestPin[], bookmarkValue: string | null, hasMoreValue: boolean, scrollPosition?: number) => {
    try {
      const cacheData = {
        pins: pinsData,
        bookmark: bookmarkValue,
        hasMore: hasMoreValue,
        scrollPosition: scrollPosition ?? window.scrollY,
        timestamp: Date.now()
      }
      sessionStorage.setItem('pinterest-pins-cache', JSON.stringify(cacheData))
    } catch (error) {
      // Ошибка сохранения в кеш
    }
  }, [])

  // Вспомогательная функция для определения количества колонок
  const getColumnsCount = useCallback(() => {
    if (typeof window === 'undefined') return 2 // SSR fallback
    const width = window.innerWidth
    if (width >= 1536) return 7 // 2xl
    if (width >= 1280) return 6 // xl
    if (width >= 1024) return 5 // lg
    if (width >= 768) return 3  // md
    if (width >= 640) return 2  // sm
    return 2 // xs
  }, [])

  // Инициализируем с правильным количеством колонок сразу
  const [columnsCount, setColumnsCount] = useState(() => getColumnsCount())

  // Определяем количество колонок только на клиенте
  useEffect(() => {
    const handleResize = () => {
      setColumnsCount(getColumnsCount())
    }

    // Обновляем количество колонок после монтирования
    setColumnsCount(getColumnsCount())

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [getColumnsCount])

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

      // Сохраняем в кеш
      saveToCache(response.items, response.bookmark || null, !!response.bookmark)
    } catch (error) {
      // Ошибка загрузки пинов
      toast.error('Не удалось загрузить пины')
    } finally {
      setLoading(false)
    }
  }, [saveToCache])

  // Загрузка дополнительных пинов
  const loadMorePins = useCallback(async () => {
    if (!hasMore || !bookmark || loadingMore) return

    try {
      setLoadingMore(true)
      const response = await pinterestAPI.getPins({ pageSize, bookmark })

      // Фильтруем дубликаты по ID
      setPins(prev => {
        const existingIds = new Set(prev.map(pin => pin.id))
        const newPins = response.items.filter(pin => !existingIds.has(pin.id))
        const updatedPins = [...prev, ...newPins]

        // Обновляем кеш с новыми данными
        saveToCache(updatedPins, response.bookmark || null, !!response.bookmark)

        return updatedPins
      })

      setBookmark(response.bookmark || null)
      setHasMore(!!response.bookmark)
    } catch (error) {
      // Ошибка загрузки дополнительных пинов
      toast.error('Не удалось загрузить больше пинов')
    } finally {
      setLoadingMore(false)
    }
  }, [bookmark, hasMore, loadingMore, saveToCache])

  // Инициализация - только если нет кеша
  useEffect(() => {
    // Если пины уже загружены из кеша, не делаем API запрос
    if (pins.length > 0) {
      // Пины уже загружены из кеша, пропускаем API запрос

      // Восстанавливаем позицию скролла из кеша
      try {
        const cached = sessionStorage.getItem('pinterest-pins-cache')
        if (cached) {
          const cachedData = JSON.parse(cached)
          if (cachedData.scrollPosition) {
            // Даем время на рендер, затем восстанавливаем скролл
            setTimeout(() => {
              window.scrollTo({
                top: cachedData.scrollPosition,
                behavior: 'auto' // Мгновенный скролл без анимации
              })
              // Восстановлена позиция скролла
            }, 100)
          }
        }
      } catch (error) {
        // Ошибка восстановления позиции скролла
      }

      return
    }

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


  // Переход к просмотру пина как гайда
  const handlePinClick = (pin: PinterestPin) => {
    // Сохраняем текущую позицию скролла в кеш перед переходом
    saveToCache(pins, bookmark, hasMore, window.scrollY)

    // Передаем данные пина через window.history.state для мгновенного рендера
    const url = `/guides/pinterest/${pin.id}`

    // Сохраняем данные пина в history state
    window.history.pushState({ pinData: pin }, '', url)

    // Программный переход через router
    router.push(url)
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

              return (
                <div
                  key={pin.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => handlePinClick(pin)}
                >
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={pin.title || 'Pinterest pin'}
                      className="w-full h-auto max-w-full object-cover"
                      loading="lazy"
                    />

                    {/* Серый overlay при наведении */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
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