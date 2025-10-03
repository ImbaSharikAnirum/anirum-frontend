/**
 * Хук для работы с гайдами
 * @layer entities
 */

import { useState, useEffect } from 'react'
import { guideAPI } from '../api/guideApi'
import type { Guide, GuidesResponse } from './types'

interface UseGuidesParams {
  type: 'popular' | 'user' | 'saved' | 'search'
  userId?: string | undefined
  query?: string
  tags?: string[]
}

export function useGuides({ type, userId, query, tags }: UseGuidesParams) {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 20

  const fetchGuides = async (page: number = 1, reset: boolean = true) => {
    try {
      if (page === 1) {
        setLoading(true)
        setError(null)
      } else {
        setLoadingMore(true)
      }

      let response: GuidesResponse

      switch (type) {
        case 'popular':
          // Популярные гайды - пока просто все гайды (как было раньше)
          response = await guideAPI.getGuides({ page, pageSize })
          break

        case 'user':
          if (!userId || userId === '') {
            throw new Error('userId required for user guides')
          }
          response = await guideAPI.getUserGuides(userId, { page, pageSize })
          break

        case 'saved':
          if (!userId || userId === '') {
            throw new Error('userId required for saved guides')
          }
          response = await guideAPI.getSavedGuides(userId, { page, pageSize })
          break

        case 'search':
          response = await guideAPI.searchGuides({
            query,
            tags,
            page,
            pageSize
          })
          break

        default:
          throw new Error(`Unknown guides type: ${type}`)
      }

      let newGuides = response.data || []

      // Для популярных - фильтруем только гайды с креативами
      if (type === 'popular') {
        newGuides = newGuides.filter(guide => {
          const creationsCount = (guide as any).creations?.length || 0
          return creationsCount > 0
        })
      }

      // Логируем что пришло
      console.log('=== useGuides DEBUG ===')
      console.log('Type:', type)
      console.log('Original count:', response.data?.length || 0)
      console.log('Filtered count:', newGuides.length)
      console.log('First guide:', newGuides[0])

      if (reset || page === 1) {
        setGuides(newGuides)
      } else {
        setGuides(prev => [...prev, ...newGuides])
      }

      // Проверяем, есть ли еще страницы
      const pagination = response.meta?.pagination
      if (pagination) {
        setHasMore(pagination.page < pagination.pageCount)
        setCurrentPage(pagination.page)
      } else {
        setHasMore(false)
      }

    } catch (err) {
      console.error('Ошибка загрузки гайдов:', err)
      setError(err instanceof Error ? err.message : 'Ошибка загрузки гайдов')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchGuides(currentPage + 1, false)
    }
  }

  const refetch = () => {
    setCurrentPage(1)
    fetchGuides(1, true)
  }

  // Автозагрузка при изменении параметров
  useEffect(() => {
    fetchGuides(1, true)
  }, [type, userId, query, JSON.stringify(tags)])

  return {
    guides,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refetch
  }
}