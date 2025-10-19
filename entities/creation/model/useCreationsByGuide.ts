/**
 * Хук для получения креативов по гайду с infinite scroll
 * @layer entities
 */

import { useState, useEffect } from 'react'
import { creationAPI } from '../api/creationApi'
import type { Creation } from './types'

interface UseCreationsByGuideParams {
  guideId: string
  excludeUserId?: string
}

export function useCreationsByGuide({ guideId, excludeUserId }: UseCreationsByGuideParams) {
  const [creations, setCreations] = useState<Creation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 20

  // Загрузка первой страницы
  useEffect(() => {
    const fetchCreations = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await creationAPI.getCreationsByGuide(guideId, excludeUserId)
        setCreations(response.data || [])
        // Пока не делаем пагинацию - показываем все
        setHasMore(false)
      } catch (err) {
        console.error('Ошибка загрузки креативов:', err)
        setError('Не удалось загрузить креативы')
      } finally {
        setLoading(false)
      }
    }

    if (guideId) {
      fetchCreations()
    }
  }, [guideId, excludeUserId])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      // TODO: Добавить пагинацию в API если понадобится
      setLoadingMore(false)
    } catch (err) {
      console.error('Ошибка загрузки дополнительных креативов:', err)
      setLoadingMore(false)
    }
  }

  return {
    creations,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore
  }
}
