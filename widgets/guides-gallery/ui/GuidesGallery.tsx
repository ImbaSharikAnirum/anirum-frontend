'use client'

/**
 * Виджет галереи гайдов с переключением между гайдами и пинами
 * @layer widgets
 */

import { useRouter } from 'next/navigation'
import { FileText, Image, TrendingUp, Bookmark, PlusCircle, Search } from 'lucide-react'
import { PinterestGallery } from '@/widgets/pinterest-gallery'
import { MasonryGallery } from '@/shared/ui'
import { useGalleryView } from '@/shared/contexts/GalleryViewContext'
import { useGuides, useGuideSave } from '@/entities/guide'
import type { User } from '@/entities/user/model/types'
import type { Guide } from '@/entities/guide/model/types'

/**
 * Сохраняет текущую позицию скролла в кеш перед переходом на детальную страницу
 */
function saveScrollPosition(cacheKey: string) {
  try {
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      const cachedData = JSON.parse(cached)
      cachedData.scrollPosition = window.scrollY
      sessionStorage.setItem(cacheKey, JSON.stringify(cachedData))
    }
  } catch (error) {
    // Ошибка сохранения позиции скролла
  }
}

interface PinterestStatus {
  isConnected: boolean
  username?: string
}

type GalleryView = 'popular' | 'guides' | 'pins' | 'saved' | 'search'

interface GuidesGalleryProps {
  user: User
  pinterestStatus: PinterestStatus | null
}

export function GuidesGallery({ user, pinterestStatus }: GuidesGalleryProps) {
  const { currentView } = useGalleryView()
  const isPinterestConnected = pinterestStatus?.isConnected

  return (
    <div className="space-y-6">
      {/* Контент в зависимости от вида */}
      {currentView === 'popular' && <PopularContent user={user} />}
      {currentView === 'guides' && <GuidesContent user={user} />}
      {currentView === 'saved' && <SavedContent user={user} />}
      {currentView === 'search' && <SearchContent user={user} />}
      {currentView === 'pins' && (
        isPinterestConnected ? (
          <PinterestGallery user={user} />
        ) : (
          <PinterestNotConnected />
        )
      )}
    </div>
  )
}

/**
 * Популярные гайды (всегда свежие данные без кеша)
 */
function PopularContent({ user }: { user: User }) {
  const router = useRouter()
  const { guides, loading, loadingMore, hasMore, loadMore } = useGuides({
    type: 'popular'
  })
  const { savingGuides, toggleSave } = useGuideSave()

  const handleGuideClick = (guide: Guide) => {
    // Сохраняем позицию скролла перед переходом
    saveScrollPosition('guides-cache-popular--')

    // Сохраняем данные гайда в history state для мгновенного рендера
    window.history.pushState({ guideData: guide }, '', `/guides/${guide.documentId}`)
    router.push(`/guides/${guide.documentId}`)
  }

  const handleSaveGuide = async (guide: any) => {
    if (!user.documentId) {
      console.error('User documentId not found')
      return
    }
    try {
      await toggleSave(guide, user.documentId)
    } catch (error) {
      console.error('Ошибка сохранения гайда:', error)
    }
  }

  return (
    <MasonryGallery
      items={guides}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onItemClick={handleGuideClick}
      onSaveItem={handleSaveGuide}
      savingItems={savingGuides}
      type="guides"
      emptyTitle="Популярные гайды"
      emptyDescription="Здесь будут отображаться самые популярные гайды сообщества"
      emptyIcon={<TrendingUp className="h-12 w-12 mx-auto text-gray-400" />}
    />
  )
}

/**
 * Мои гайды
 */
function GuidesContent({ user }: { user: User }) {
  const router = useRouter()
  const shouldFetch = Boolean(user.documentId && user.documentId !== '')
  const { guides, loading, loadingMore, hasMore, loadMore } = useGuides({
    type: 'user',
    userId: user.documentId || ''
  })
  const { savingGuides, toggleSave } = useGuideSave()

  const handleGuideClick = (guide: Guide) => {
    // Сохраняем позицию скролла перед переходом
    saveScrollPosition(`guides-cache-user-${user.documentId || ''}--`)

    // Сохраняем данные гайда в history state для мгновенного рендера
    window.history.pushState({ guideData: guide }, '', `/guides/${guide.documentId}`)
    router.push(`/guides/${guide.documentId}`)
  }

  const handleSaveGuide = async (guide: any) => {
    if (!user.documentId) {
      console.error('User documentId not found')
      return
    }
    try {
      await toggleSave(guide, user.documentId)
    } catch (error) {
      console.error('Ошибка сохранения гайда:', error)
    }
  }

  if (!shouldFetch) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <FileText className="h-12 w-12 mx-auto text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-gray-600 mb-4">
              Не удалось определить пользователя
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MasonryGallery
      items={guides}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onItemClick={handleGuideClick}
      onSaveItem={handleSaveGuide}
      savingItems={savingGuides}
      type="guides"
      emptyTitle="У вас пока нет гайдов"
      emptyDescription="Сохраните пины из Pinterest как гайды или создайте собственные"
      emptyIcon={<FileText className="h-12 w-12 mx-auto text-gray-400" />}
    />
  )
}

/**
 * Сохраненные гайды
 */
function SavedContent({ user }: { user: User }) {
  const router = useRouter()
  const shouldFetch = Boolean(user.documentId && user.documentId !== '')
  const { guides, loading, loadingMore, hasMore, loadMore } = useGuides({
    type: 'saved',
    userId: user.documentId || ''
  })
  const { savingGuides, toggleSave } = useGuideSave()

  const handleGuideClick = (guide: Guide) => {
    // Сохраняем позицию скролла перед переходом
    saveScrollPosition(`guides-cache-saved-${user.documentId || ''}--`)

    // Сохраняем данные гайда в history state для мгновенного рендера
    window.history.pushState({ guideData: guide }, '', `/guides/${guide.documentId}`)
    router.push(`/guides/${guide.documentId}`)
  }

  const handleSaveGuide = async (guide: any) => {
    if (!user.documentId) {
      console.error('User documentId not found')
      return
    }
    try {
      await toggleSave(guide, user.documentId)
    } catch (error) {
      console.error('Ошибка сохранения гайда:', error)
    }
  }

  if (!shouldFetch) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto space-y-4">
          <Bookmark className="h-12 w-12 mx-auto text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ошибка загрузки
            </h3>
            <p className="text-gray-600 mb-4">
              Не удалось определить пользователя
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MasonryGallery
      items={guides}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onItemClick={handleGuideClick}
      onSaveItem={handleSaveGuide}
      savingItems={savingGuides}
      type="guides"
      emptyTitle="У вас пока нет сохраненных гайдов"
      emptyDescription="Сохраняйте понравившиеся гайды, чтобы они всегда были под рукой"
      emptyIcon={<Bookmark className="h-12 w-12 mx-auto text-gray-400" />}
    />
  )
}

/**
 * Результаты поиска
 */
function SearchContent({ user }: { user: User }) {
  const router = useRouter()
  const { searchQuery, searchTags } = useGalleryView()
  const { guides, loading, loadingMore, hasMore, loadMore } = useGuides({
    type: 'search',
    query: searchQuery,
    tags: searchTags,
    userId: user.documentId // 🔧 Передаем userId для специальных запросов
  })
  const { savingGuides, toggleSave } = useGuideSave()

  const handleGuideClick = (guide: Guide) => {
    // Сохраняем позицию скролла перед переходом
    saveScrollPosition(`guides-cache-search--${searchQuery || ''}-${(searchTags || []).join(',')}`)

    // Сохраняем данные гайда в history state для мгновенного рендера
    window.history.pushState({ guideData: guide }, '', `/guides/${guide.documentId}`)
    router.push(`/guides/${guide.documentId}`)
  }

  const handleSaveGuide = async (guide: any) => {
    if (!user.documentId) {
      console.error('User documentId not found')
      return
    }
    try {
      await toggleSave(guide, user.documentId)
    } catch (error) {
      console.error('Ошибка сохранения гайда:', error)
    }
  }

  const getEmptyDescription = () => {
    if (searchQuery && searchTags.length > 0) {
      return `Не найдено гайдов по запросу "${searchQuery}" и тегам: ${searchTags.join(', ')}`
    } else if (searchQuery) {
      return `Не найдено гайдов по запросу "${searchQuery}"`
    } else if (searchTags.length > 0) {
      return `Не найдено гайдов с тегами: ${searchTags.join(', ')}`
    }
    return 'Введите запрос для поиска гайдов'
  }

  return (
    <MasonryGallery
      items={guides}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onItemClick={handleGuideClick}
      onSaveItem={handleSaveGuide}
      savingItems={savingGuides}
      type="guides"
      emptyTitle="Результаты поиска"
      emptyDescription={getEmptyDescription()}
      emptyIcon={<Search className="h-12 w-12 mx-auto text-gray-400" />}
    />
  )
}

/**
 * Состояние когда Pinterest не подключен
 */
function PinterestNotConnected() {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto space-y-4">
        <Image className="h-12 w-12 mx-auto text-gray-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Pinterest не подключен
          </h3>
          <p className="text-gray-600 mb-4">
            Подключите Pinterest через поиск, чтобы импортировать ваши пины
          </p>
        </div>
      </div>
    </div>
  )
}