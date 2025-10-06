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
  // Генерируем уникальный ключ для кеша на основе параметров
  const cacheKey = `guides-cache-${type}-${userId || ''}-${query || ''}-${(tags || []).join(',')}`

  // Инициализация из кеша
  const [guides, setGuides] = useState<Guide[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const cachedData = JSON.parse(cached)
          return cachedData.guides || []
        }
      } catch (error) {
        // Ошибка чтения кеша
      }
    }
    return []
  })

  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const cachedData = JSON.parse(cached)
          return !cachedData.guides || cachedData.guides.length === 0
        }
      } catch (error) {
        // Ошибка проверки кеша
      }
    }
    return true
  })

  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [hasMore, setHasMore] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const cachedData = JSON.parse(cached)
          return cachedData.hasMore !== false
        }
      } catch (error) {
        // Ошибка чтения hasMore
      }
    }
    return true
  })

  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const cachedData = JSON.parse(cached)
          return cachedData.currentPage || 1
        }
      } catch (error) {
        // Ошибка чтения currentPage
      }
    }
    return 1
  })

  const pageSize = 20

  // Функция сохранения в кеш
  const saveToCache = (guidesData: Guide[], page: number, hasMoreValue: boolean, scrollPosition?: number) => {
    try {
      const cacheData = {
        guides: guidesData,
        currentPage: page,
        hasMore: hasMoreValue,
        scrollPosition: scrollPosition ?? window.scrollY,
        timestamp: Date.now()
      }
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      // Ошибка сохранения в кеш
    }
  }

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

      // Для популярных - фильтрация и сортировка уже выполнена на бэкенде
      // Бэкенд возвращает только гайды с creationsCount > 0, отсортированные по популярности

      const pagination = response.meta?.pagination
      const hasMoreValue = pagination ? pagination.page < pagination.pageCount : false
      const currentPageValue = pagination ? pagination.page : page

      if (reset || page === 1) {
        setGuides(newGuides)
        saveToCache(newGuides, currentPageValue, hasMoreValue)
      } else {
        setGuides(prev => {
          const updatedGuides = [...prev, ...newGuides]
          saveToCache(updatedGuides, currentPageValue, hasMoreValue)
          return updatedGuides
        })
      }

      setHasMore(hasMoreValue)
      setCurrentPage(currentPageValue)

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

  // Автозагрузка при изменении параметров - только если нет кеша
  useEffect(() => {
    // Если гайды уже загружены из кеша, не делаем API запрос
    if (guides.length > 0) {
      // Восстанавливаем позицию скролла из кеша
      try {
        const cached = sessionStorage.getItem(cacheKey)
        if (cached) {
          const cachedData = JSON.parse(cached)
          if (cachedData.scrollPosition) {
            // Даем время на рендер, затем восстанавливаем скролл
            setTimeout(() => {
              window.scrollTo({
                top: cachedData.scrollPosition,
                behavior: 'auto' // Мгновенный скролл без анимации
              })
            }, 100)
          }
        }
      } catch (error) {
        // Ошибка восстановления позиции скролла
      }
      return
    }

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