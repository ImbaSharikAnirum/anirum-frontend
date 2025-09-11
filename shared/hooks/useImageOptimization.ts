/**
 * Хук для оптимизации изображений
 * @layer shared
 */

import { useMemo } from 'react'
import { getOptimalImageFormat } from '@/shared/lib/course-utils'

interface ImageOptimizationConfig {
  quality?: number
  priority?: boolean
  sizes?: string
  context?: 'card' | 'modal' | 'hero' | 'thumbnail'
}

interface OptimizedImageProps {
  src: string
  quality: number
  priority: boolean
  sizes: string
}

/**
 * Хук для оптимизации настроек изображений
 */
export function useImageOptimization(
  image: any,
  config: ImageOptimizationConfig = {}
): OptimizedImageProps {
  const {
    quality = 90,
    priority = false,
    sizes = '100vw',
    context = 'card'
  } = config

  return useMemo(() => {
    const src = typeof image === 'string' 
      ? image 
      : getOptimalImageFormat(image, context)

    // Настройки качества в зависимости от контекста
    const contextQuality = {
      card: Math.max(quality, 90), // Минимум 90% для карточек
      modal: Math.max(quality, 95), // Минимум 95% для модальных окон
      hero: Math.max(quality, 95), // Минимум 95% для hero секций
      thumbnail: Math.max(quality, 85) // Минимум 85% для миниатюр
    }

    // Адаптивные размеры в зависимости от контекста
    const contextSizes = {
      card: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      modal: '(max-width: 640px) 95vw, (max-width: 1024px) 80vw, 70vw',
      hero: '100vw',
      thumbnail: '(max-width: 640px) 25vw, (max-width: 1024px) 20vw, 15vw'
    }

    return {
      src,
      quality: contextQuality[context],
      priority,
      sizes: sizes === '100vw' ? contextSizes[context] : sizes
    }
  }, [image, quality, priority, sizes, context])
}

/**
 * Хук для проверки поддержки современных форматов
 */
export function useImageFormatSupport() {
  return useMemo(() => {
    if (typeof window === 'undefined') return { webp: false, avif: false }

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1

    const webp = canvas.toDataURL('image/webp').startsWith('data:image/webp')
    const avif = canvas.toDataURL('image/avif').startsWith('data:image/avif')

    return { webp, avif }
  }, [])
}