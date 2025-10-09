'use client'

/**
 * Универсальный компонент галереи в стиле Pinterest с Masonry layout
 * Поддерживает как пины, так и гайды
 * @layer shared/ui
 */

import { useState, useEffect, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Guide } from '@/entities/guide/model/types'
import type { PinterestPin } from '@/entities/pinterest/model/types'

type GalleryItem = Guide | PinterestPin

interface MasonryGalleryProps<T extends GalleryItem = GalleryItem> {
  items: T[]
  loading?: boolean
  loadingMore?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  onItemClick?: (item: T) => void
  onSaveItem?: (item: T) => void
  savingItems?: Set<string>
  type: 'guides' | 'pins'
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: React.ReactNode
}

export function MasonryGallery<T extends GalleryItem = GalleryItem>({
  items,
  loading = false,
  loadingMore = false,
  onLoadMore,
  hasMore = false,
  onItemClick,
  onSaveItem,
  savingItems = new Set(),
  type,
  emptyTitle = 'Пока ничего нет',
  emptyDescription = 'Скоро здесь появится контент',
  emptyIcon
}: MasonryGalleryProps<T>) {
  // Функция определения количества колонок
  const getColumnsCount = () => {
    if (typeof window === 'undefined') return 2 // SSR fallback
    const width = window.innerWidth
    if (width >= 1536) return 7 // 2xl
    if (width >= 1280) return 6 // xl
    if (width >= 1024) return 5 // lg
    if (width >= 768) return 3  // md
    if (width >= 640) return 2  // sm
    return 2 // xs (320px и меньше)
  }

  // Флаг монтирования для предотвращения hydration mismatch
  const [mounted, setMounted] = useState(false)

  // Инициализируем с правильным количеством колонок сразу
  const [columnsCount, setColumnsCount] = useState(() => getColumnsCount())

  // Устанавливаем флаг после монтирования
  useEffect(() => {
    setMounted(true)
  }, [])

  // Обновляем колонки при resize
  useEffect(() => {
    const handleResize = () => {
      setColumnsCount(getColumnsCount())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Infinite scroll: автоматически загружаем больше при достижении конца страницы
  useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore || loading) return

    const handleScroll = () => {
      // Проверяем, достиг ли пользователь конца страницы (за 1000px до конца)
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        onLoadMore()
      }
    }

    // 🔧 Автозагрузка если контент не заполняет экран
    const checkContentHeight = () => {
      if (!mounted) return

      // Проверяем есть ли скроллбар
      const hasScroll = document.documentElement.scrollHeight > window.innerHeight + 100

      // Если контент не создает скролл и есть еще данные - загружаем больше
      if (!hasScroll && items.length > 0) {
        console.log('📍 Content too short, auto-loading more items...', {
          scrollHeight: document.documentElement.scrollHeight,
          windowHeight: window.innerHeight,
          itemsCount: items.length
        })
        onLoadMore()
      }
    }

    // Проверяем сразу после рендера
    checkContentHeight()

    // И через небольшую задержку для загрузки изображений
    const timeoutId = setTimeout(checkContentHeight, 300)

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeoutId)
    }
  }, [onLoadMore, hasMore, loadingMore, loading, mounted, items.length])

  // Распределяем элементы по колонкам для Masonry layout
  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: columnsCount }, () => [])

    items.forEach((item, index) => {
      const columnIndex = index % columnsCount
      cols[columnIndex].push(item)
    })

    return cols
  }, [items, columnsCount])

  // Получаем изображение элемента
  const getItemImage = (item: GalleryItem): string | undefined => {
    if (type === 'pins') {
      const pin = item as PinterestPin
      return pin.media?.images?.['474x']?.url
    } else {
      const guide = item as Guide
      return guide.image?.url
    }
  }

  // Получаем ID элемента
  const getItemId = (item: GalleryItem): string => {
    return type === 'pins' ? (item as PinterestPin).id : (item as Guide).documentId
  }

  // Получаем заголовок элемента
  const getItemTitle = (item: GalleryItem): string => {
    if (type === 'pins') {
      const pin = item as PinterestPin
      return pin.title || pin.description || 'Без названия'
    } else {
      const guide = item as Guide
      return guide.title
    }
  }

  // Получаем ссылку элемента
  const getItemLink = (item: GalleryItem): string | undefined => {
    if (type === 'pins') {
      const pin = item as PinterestPin
      return pin.link
    } else {
      const guide = item as Guide
      return guide.link
    }
  }

  // Получаем автора элемента
  const getItemAuthor = (item: GalleryItem): string | undefined => {
    if (type === 'pins') {
      return undefined // У пинов пока нет автора
    } else {
      const guide = item as Guide
      return guide.users_permissions_user?.username
    }
  }

  // Скелетон для загрузки
  const renderSkeleton = () => (
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

  // Пустое состояние
  const renderEmpty = () => (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto space-y-4">
        {emptyIcon && <div className="flex justify-center">{emptyIcon}</div>}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyTitle}
          </h3>
          <p className="text-gray-600 mb-4">
            {emptyDescription}
          </p>
        </div>
      </div>
    </div>
  )

  // Показываем пустой div до монтирования для предотвращения hydration mismatch
  if (!mounted) {
    return <div className="h-screen" /> // Placeholder для SSR
  }

  // После монтирования показываем skeleton если загружается
  if (loading) {
    return renderSkeleton()
  }

  if (items.length === 0) {
    return renderEmpty()
  }

  return (
    <div className="space-y-6">
      {/* Masonry grid */}
      <div className="flex gap-2 md:gap-4">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex-1 min-w-0 space-y-2 md:space-y-4">
            {column.map((item) => (
              <GalleryItem
                key={getItemId(item)}
                item={item}
                imageUrl={getItemImage(item)}
                title={getItemTitle(item)}
                link={getItemLink(item)}
                author={getItemAuthor(item)}
                type={type}
                onClick={() => onItemClick?.(item as T)}
                onSave={() => onSaveItem?.(item as T)}
                isSaving={savingItems.has(getItemId(item))}
              />
            ))}

            {/* Скелетоны загрузки в конце каждой колонки при loadingMore */}
            {loadingMore && (
              <>
                {Array.from({ length: Math.ceil(10 / columnsCount) }).map((_, i) => {
                  // Детерминированные высоты для предотвращения hydration mismatch
                  const heights = [280, 320, 240, 360, 300, 220, 380, 260, 340, 290, 250, 310, 270, 350, 230]
                  const skeletonIndex = colIndex * Math.ceil(10 / columnsCount) + i
                  return (
                    <Skeleton
                      key={`loading-${colIndex}-${i}`}
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
      {!hasMore && items.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Все элементы загружены</p>
        </div>
      )}
    </div>
  )
}

interface GalleryItemProps {
  item: GalleryItem
  imageUrl?: string
  title: string
  link?: string
  author?: string
  type: 'guides' | 'pins'
  onClick?: () => void
  onSave?: () => void
  isSaving?: boolean
}

function GalleryItem({
  item,
  imageUrl,
  title,
  link,
  author,
  type,
  onClick,
  onSave,
  isSaving = false
}: GalleryItemProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      {/* Изображение */}
      {imageUrl && (
        <div className="relative" onClick={onClick}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-auto max-w-full object-cover"
            loading="lazy"
          />

          {/* Серый overlay при наведении */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          </div>
        </div>
      )}
    </div>
  )
}