'use client'

/**
 * Контекст для управления видом галереи (гайды/пины)
 * @layer shared/contexts
 */

import { createContext, useContext, useState, ReactNode } from 'react'

type GalleryView = 'popular' | 'guides' | 'pins' | 'saved' | 'search'

interface GalleryViewContextType {
  currentView: GalleryView
  setCurrentView: (view: GalleryView) => void
  switchToPopular: () => void
  switchToMyPins: () => void
  switchToMyGuides: () => void
  switchToSaved: () => void
  switchToSearch: (query: string, tags?: string[]) => void
  searchQuery: string
  searchTags: string[]
}

const GalleryViewContext = createContext<GalleryViewContextType | undefined>(undefined)

interface GalleryViewProviderProps {
  children: ReactNode
  defaultView?: GalleryView
}

export function GalleryViewProvider({ children, defaultView = 'popular' }: GalleryViewProviderProps) {
  const [currentView, setCurrentView] = useState<GalleryView>(defaultView)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTags, setSearchTags] = useState<string[]>([])

  const switchToPopular = () => {
    setCurrentView('popular')
    // Скролл к галерее
    setTimeout(() => {
      const galleryElement = document.querySelector('.guides-gallery')
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

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

  const switchToSearch = (query: string, tags: string[] = []) => {
    setSearchQuery(query)
    setSearchTags(tags)
    setCurrentView('search')
    // Скролл к галерее
    setTimeout(() => {
      const galleryElement = document.querySelector('.guides-gallery')
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

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