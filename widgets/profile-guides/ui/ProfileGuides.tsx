'use client'

/**
 * Виджет отображения гайдов пользователя в профиле
 * @layer widgets
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen } from 'lucide-react'
import { guideAPI, type Guide } from '@/entities/guide'
import { MasonryGallery } from '@/shared/ui'
import type { User } from '@/entities/user/model/types'

interface ProfileGuidesProps {
  user: User | null
}

export function ProfileGuides({ user }: ProfileGuidesProps) {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const fetchGuides = async () => {
      if (!user?.documentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await guideAPI.getUserGuides(user.documentId, { page: 1, pageSize: 20 })
        setGuides(response.data || [])
        setHasMore((response.meta?.pagination?.page || 1) < (response.meta?.pagination?.pageCount || 1))
        setCurrentPage(1)
      } catch (err) {
        console.error('Ошибка загрузки гайдов:', err)
        setError('Не удалось загрузить гайды')
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [user?.documentId])

  const loadMore = async () => {
    if (!user?.documentId || loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      const response = await guideAPI.getUserGuides(user.documentId, { page: nextPage, pageSize: 20 })
      setGuides(prev => [...prev, ...(response.data || [])])
      setHasMore((response.meta?.pagination?.page || nextPage) < (response.meta?.pagination?.pageCount || nextPage))
      setCurrentPage(nextPage)
    } catch (err) {
      console.error('Ошибка загрузки дополнительных гайдов:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleGuideClick = (guide: Guide) => {
    // Сохраняем данные гайда в history state для мгновенного рендера
    window.history.pushState({ guideData: guide }, '', `/guides/${guide.documentId}`)
    router.push(`/guides/${guide.documentId}`)
  }

  if (!user) {
    return null
  }

  return (
    <MasonryGallery
      items={guides}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onItemClick={handleGuideClick}
      type="guides"
      emptyTitle="Гайды пока не добавлены"
      emptyDescription="Здесь будут отображаться ваши гайды"
      emptyIcon={<BookOpen className="h-12 w-12 mx-auto text-gray-400" />}
    />
  )
}
