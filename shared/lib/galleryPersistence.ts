/**
 * Gallery State Persistence Manager
 * Управление сохранением и восстановлением состояния галереи
 * @layer shared/lib
 */

export type GalleryView = 'popular' | 'guides' | 'pins' | 'saved' | 'search'

interface GalleryState {
  view: GalleryView
  query: string
  tags: string[]
  timestamp: number
}

const STORAGE_KEY = 'gallery-state'
const MAX_AGE_MS = 30 * 60 * 1000 // 30 минут

/**
 * Singleton класс для управления персистентностью состояния галереи
 */
class GalleryPersistenceManager {
  /**
   * Сохраняет текущее состояние
   */
  save(state: Omit<GalleryState, 'timestamp'>): void {
    if (typeof window === 'undefined') return

    try {
      const stateWithTimestamp: GalleryState = {
        ...state,
        timestamp: Date.now()
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp))
      console.log('💾 Gallery state saved:', state.view, state.query ? `"${state.query}"` : '')
    } catch (error) {
      console.error('Failed to save gallery state:', error)
    }
  }

  /**
   * Восстанавливает сохраненное состояние
   * Возвращает null если состояние устарело или отсутствует
   */
  restore(): GalleryState | null {
    if (typeof window === 'undefined') return null

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (!saved) return null

      const state: GalleryState = JSON.parse(saved)

      // Проверяем возраст кеша
      const age = Date.now() - state.timestamp
      if (age > MAX_AGE_MS) {
        console.log('⏰ Gallery state expired, clearing...')
        this.clear()
        return null
      }

      console.log('📦 Gallery state restored:', state.view, `(${Math.round(age / 1000)}s old)`)
      return state
    } catch (error) {
      console.error('Failed to restore gallery state:', error)
      return null
    }
  }

  /**
   * Очищает сохраненное состояние
   */
  clear(): void {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.removeItem(STORAGE_KEY)
      console.log('🗑️ Gallery state cleared')
    } catch (error) {
      console.error('Failed to clear gallery state:', error)
    }
  }

  /**
   * Проверяет нужно ли восстанавливать состояние
   * Используется для определения: reload vs navigation
   */
  shouldRestore(): boolean {
    if (typeof window === 'undefined') return false

    const state = this.restore()
    return state !== null
  }

  /**
   * Получает возраст сохраненного состояния в миллисекундах
   */
  getStateAge(): number | null {
    if (typeof window === 'undefined') return null

    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (!saved) return null

      const state: GalleryState = JSON.parse(saved)
      return Date.now() - state.timestamp
    } catch {
      return null
    }
  }
}

// Экспортируем синглтон
export const galleryPersistence = new GalleryPersistenceManager()
