'use client'

/**
 * Контекст для управления видом галереи (гайды/пины)
 * Использует GalleryPersistenceManager для сохранения состояния
 * @layer shared/contexts
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { galleryPersistence, type GalleryView } from '@/shared/lib/galleryPersistence'

interface GalleryViewContextType {
  currentView: GalleryView
  setCurrentView: (view: GalleryView) => void
  switchToPopular: (shouldScroll?: boolean) => void
  switchToMyPins: () => void
  switchToMyGuides: () => void
  switchToSaved: () => void
  switchToSearch: (query: string, tags?: string[], shouldScroll?: boolean) => void
  searchQuery: string
  searchTags: string[]
}

const GalleryViewContext = createContext<GalleryViewContextType | undefined>(undefined)

interface GalleryViewProviderProps {
  children: ReactNode
  defaultView?: GalleryView
}

export function GalleryViewProvider({ children, defaultView = 'popular' }: GalleryViewProviderProps) {
  // 🔧 Восстанавливаем состояние через GalleryPersistenceManager
  const [currentView, setCurrentView] = useState<GalleryView>(() => {
    const saved = galleryPersistence.restore()
    return saved?.view || defaultView
  })

  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = galleryPersistence.restore()
    return saved?.query || ''
  })

  const [searchTags, setSearchTags] = useState<string[]>(() => {
    const saved = galleryPersistence.restore()
    return saved?.tags || []
  })

  // 🔧 Автосохранение при изменении состояния
  useEffect(() => {
    // Сохраняем searchQuery и tags только если мы в режиме поиска
    // Иначе сохраняем пустые значения
    galleryPersistence.save({
      view: currentView,
      query: currentView === 'search' ? searchQuery : '',
      tags: currentView === 'search' ? searchTags : []
    })
  }, [currentView, searchQuery, searchTags])

  // Обработка hash в URL для переключения на Pinterest
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash
      if (hash === '#pinterest') {
        setCurrentView('pins')
        // Очищаем hash для чистого URL
        window.history.replaceState(null, '', window.location.pathname)
        // Скролл к галерее
        setTimeout(() => {
          const galleryElement = document.querySelector('.guides-gallery')
          if (galleryElement) {
            galleryElement.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    }

    // Проверяем hash при загрузке
    checkHash()

    // Слушаем изменения hash
    window.addEventListener('hashchange', checkHash)

    return () => {
      window.removeEventListener('hashchange', checkHash)
    }
  }, [])

  const switchToPopular = useCallback((shouldScroll = true) => {
    setCurrentView('popular')
    // Очищаем поисковый запрос при переходе на популярные
    setSearchQuery('')
    setSearchTags([])

    // Скролл только если явно запрошено
    if (shouldScroll) {
      setTimeout(() => {
        const galleryElement = document.querySelector('.guides-gallery')
        if (galleryElement) {
          const rect = galleryElement.getBoundingClientRect()
          const isVisible = rect.top >= 0 && rect.top <= window.innerHeight

          // Скроллим только если не видна
          if (!isVisible) {
            galleryElement.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }, 100)
    }
  }, [])

  const switchToMyPins = () => {
    setCurrentView('pins')
    // Скролл к галерее
    setTimeout(() => {
      const galleryElement = document.querySelector('.guides-gallery')
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const switchToMyGuides = () => {
    setCurrentView('guides')
    // Скролл к галерее
    setTimeout(() => {
      const galleryElement = document.querySelector('.guides-gallery')
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const switchToSaved = () => {
    setCurrentView('saved')
    // Скролл к галерее
    setTimeout(() => {
      const galleryElement = document.querySelector('.guides-gallery')
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const switchToSearch = useCallback((query: string, tags: string[] = [], shouldScroll = false) => {
    setSearchQuery(query)
    setSearchTags(tags)
    setCurrentView('search')

    // Скролл только если галерея не видна И пользователь явно запросил действие
    if (shouldScroll) {
      setTimeout(() => {
        const galleryElement = document.querySelector('.guides-gallery')
        if (galleryElement) {
          const rect = galleryElement.getBoundingClientRect()
          const isVisible = rect.top >= 0 && rect.top <= window.innerHeight

          // Скроллим только если галерея не видна на экране
          if (!isVisible) {
            galleryElement.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }, 100)
    }
  }, [])

  return (
    <GalleryViewContext.Provider
      value={{
        currentView,
        setCurrentView,
        switchToPopular,
        switchToMyPins,
        switchToMyGuides,
        switchToSaved,
        switchToSearch,
        searchQuery,
        searchTags,
      }}
    >
      {children}
    </GalleryViewContext.Provider>
  )
}

export function useGalleryView() {
  const context = useContext(GalleryViewContext)
  if (context === undefined) {
    throw new Error('useGalleryView must be used within a GalleryViewProvider')
  }
  return context
}