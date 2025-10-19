'use client'

/**
 * Виджет отображения креативов пользователя в профиле
 * @layer widgets
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Image } from 'lucide-react'
import { creationAPI, type Creation } from '@/entities/creation'
import { MasonryGallery } from '@/shared/ui'
import type { User } from '@/entities/user/model/types'

interface ProfileCreationsProps {
  user: User | null
}

export function ProfileCreations({ user }: ProfileCreationsProps) {
  const router = useRouter()
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    const fetchCreations = async () => {
      if (!user?.documentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await creationAPI.getUserCreations(user.documentId, { page: 1, pageSize: 20 })
        setCreations(response.data || [])
        setHasMore((response.meta?.pagination?.page || 1) < (response.meta?.pagination?.pageCount || 1))
        setCurrentPage(1)
      } catch (err) {
        console.error('Ошибка загрузки креативов:', err)
        setError('Не удалось загрузить креативы')
      } finally {
        setLoading(false)
      }
    }

    fetchCreations()
  }, [user?.documentId])

  const loadMore = async () => {
    if (!user?.documentId || loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const nextPage = currentPage + 1
      const response = await creationAPI.getUserCreations(user.documentId, { page: nextPage, pageSize: 20 })
      setCreations(prev => [...prev, ...(response.data || [])])
      setHasMore((response.meta?.pagination?.page || nextPage) < (response.meta?.pagination?.pageCount || nextPage))
      setCurrentPage(nextPage)
    } catch (err) {
      console.error('Ошибка загрузки дополнительных креативов:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleCreationClick = (item: any) => {
    // Находим оригинальный creation по documentId
    const creation = creations.find(c => c.documentId === item.documentId)

    if (creation?.documentId) {
      // Переходим на страницу креатива
      router.push(`/creations/${creation.documentId}`)
    }
  }

  if (!user) {
    return null
  }

  // Адаптируем Creation под формат Guide для MasonryGallery
  const adaptedCreations = creations.map(creation => ({
    ...creation,
    title: `Креатив по гайду "${creation.guide?.title || 'Без названия'}"`,
    link: undefined,
    tags: [],
    approved: true
  }))

  return (
    <MasonryGallery
      items={adaptedCreations as any}
      loading={loading}
      loadingMore={loadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onItemClick={handleCreationClick}
      type="guides"
      emptyTitle="Креативы пока не добавлены"
      emptyDescription="Здесь будут отображаться ваши креативы"
      emptyIcon={<Image className="h-12 w-12 mx-auto text-gray-400" />}
    />
  )
}
