/**
 * Утилита для предзагрузки изображений
 * Используется для устранения постепенного появления изображений
 */

/**
 * Предзагружает одно изображение
 * @param src - URL изображения
 * @returns Promise, который резолвится когда изображение загружено
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve()
      return
    }

    const img = new Image()

    img.onload = () => {
      resolve()
    }

    img.onerror = () => {
      // Не реджектим, чтобы не блокировать показ других изображений
      console.warn(`Failed to preload image: ${src}`)
      resolve()
    }

    img.src = src
  })
}

/**
 * Предзагружает массив изображений параллельно
 * @param sources - Массив URL изображений
 * @returns Promise, который резолвится когда все изображения загружены
 */
export function preloadImages(sources: string[]): Promise<void[]> {
  const validSources = sources.filter(src => src && typeof src === 'string')
  return Promise.all(validSources.map(src => preloadImage(src)))
}

/**
 * Предзагружает изображения с таймаутом
 * @param sources - Массив URL изображений
 * @param timeout - Таймаут в миллисекундах (по умолчанию 5000)
 * @returns Promise, который резолвится когда все изображения загружены или истек таймаут
 */
export function preloadImagesWithTimeout(sources: string[], timeout = 5000): Promise<void> {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn('Image preloading timeout exceeded')
      resolve()
    }, timeout)

    preloadImages(sources)
      .then(() => {
        clearTimeout(timeoutId)
        resolve()
      })
      .catch(() => {
        clearTimeout(timeoutId)
        resolve()
      })
  })
}
