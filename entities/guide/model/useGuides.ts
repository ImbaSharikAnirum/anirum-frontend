/**
 * Хук для работы с гайдами
 * @layer entities
 */

import { useState, useEffect, useRef } from 'react'
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

  // Популярные НЕ кешируем - всегда свежие данные
  // Поиск КЕШИРУЕМ - для быстрого возврата назад, но проверяем актуальность
  const shouldUseCache = type !== 'popular'

  // 🔧 Lazy init - проверяем кеш при инициализации состояния
  const [guides, setGuides] = useState<Guide[]>(() => {
    if (!shouldUseCache || typeof window === 'undefined') return []

    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const data = JSON.parse(cached)
        const cacheAge = Date.now() - (data.timestamp || 0)
        const maxAge = type === 'search' ? 5 * 60 * 1000 : 30 * 60 * 1000

        if (data.guides && cacheAge <= maxAge) {
          console.log('🚀 Init with cache:', data.guides.length, 'guides')
          return data.guides
        }
      }
    } catch (e) {
      // Игнорируем ошибки кеша
    }
    return []
  })

  const [loading, setLoading] = useState(() => {
    // Если есть закешированные данные - не показываем loading
    return guides.length === 0
  })

  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [hasMore, setHasMore] = useState(() => {
    if (!shouldUseCache || typeof window === 'undefined') return true

    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const data = JSON.parse(cached)
        return data.hasMore !== false
      }
    } catch (e) {
      // Игнорируем ошибки
    }
    return true
  })

  const [currentPage, setCurrentPage] = useState(() => {
    if (!shouldUseCache || typeof window === 'undefined') return 1

    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const data = JSON.parse(cached)
        return data.currentPage || 1
      }
    } catch (e) {
      // Игнорируем ошибки
    }
    return 1
  })

  // 🔧 Адаптивный размер страницы для заполнения экрана без белых пятен
  // Мобильные: 20 (1-2 колонки), Планшеты: 30 (3 колонки), Десктоп: 40 (4-5 колонок)
  const getPageSize = () => {
    if (typeof window === 'undefined') return 40 // SSR fallback
    const width = window.innerWidth
    if (width < 768) return 20 // mobile
    if (width < 1280) return 30 // tablet
    return 40 // desktop
  }

  const pageSize = getPageSize()

  // Функция сохранения в кеш (только для не-популярных)
  const saveToCache = (guidesData: Guide[], page: number, hasMoreValue: boolean, scrollPosition?: number) => {
    if (!shouldUseCache) return // Не кешируем популярные

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
            userId, // 🔧 Передаем userId для специальных запросов
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
          // Фильтруем дубликаты по documentId
          const existingIds = new Set(prev.map(guide => guide.documentId))
          const uniqueNewGuides = newGuides.filter(guide => !existingIds.has(guide.documentId))
          const updatedGuides = [...prev, ...uniqueNewGuides]
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

  // Ref для отслеживания первого рендера
  const isInitialMount = useRef(true)

  // Автозагрузка при изменении параметров
  useEffect(() => {
    console.log(`📍 useGuides effect triggered:`, {
      type,
      query,
      cacheKey,
      hasInitialData: guides.length > 0,
      isInitialMount: isInitialMount.current
    })

    // При первом монтировании - если есть данные из lazy init, только восстанавливаем скролл
    if (isInitialMount.current) {
      isInitialMount.current = false

      if (guides.length > 0 && shouldUseCache) {
        console.log('✅ Using cached data from initialization')

        // Восстанавливаем скролл из кеша
        try {
          const cached = sessionStorage.getItem(cacheKey)
          if (cached) {
            const cachedData = JSON.parse(cached)
            if (cachedData.scrollPosition) {
              setTimeout(() => {
                window.scrollTo({ top: cachedData.scrollPosition, behavior: 'instant' })
                console.log('📍 Scroll restored:', cachedData.scrollPosition)
              }, 100)
            }
          }
        } catch (e) {
          // Игнорируем
        }

        return // Не делаем запрос
      }
    }

    // При изменении параметров - всегда делаем запрос
    setLoading(true)
    setError(null)

    console.log(`🌐 Fetching from API (${shouldUseCache ? 'params changed' : 'caching disabled'})`)
    fetchGuides(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, userId, query, JSON.stringify(tags), cacheKey])

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