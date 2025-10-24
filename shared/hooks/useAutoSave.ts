import { useEffect, useRef, useCallback } from 'react'

interface UseAutoSaveOptions {
  /**
   * Функция для сохранения данных
   */
  onSave: () => Promise<void> | void

  /**
   * Задержка в миллисекундах перед сохранением (debounce)
   * По умолчанию: 5000 (5 секунд)
   */
  delay?: number

  /**
   * Флаг, указывающий есть ли несохраненные изменения
   */
  hasChanges: boolean

  /**
   * Включить/выключить auto-save
   */
  enabled?: boolean
}

/**
 * Хук для автоматического сохранения с debounce
 *
 * @example
 * ```tsx
 * const { triggerSave, cancelSave } = useAutoSave({
 *   onSave: async () => {
 *     await saveData()
 *   },
 *   delay: 5000,
 *   hasChanges: true,
 *   enabled: true
 * })
 * ```
 */
export function useAutoSave({
  onSave,
  delay = 5000,
  hasChanges,
  enabled = true,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const isSavingRef = useRef(false)

  // Очистка таймера
  const cancelSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }
  }, [])

  // Запуск сохранения с debounce
  const triggerSave = useCallback(() => {
    if (!enabled || !hasChanges) return

    // Отменяем предыдущий таймер
    cancelSave()

    // Создаем новый таймер
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return

      try {
        isSavingRef.current = true
        await onSave()
      } catch (error) {
        console.error('Auto-save error:', error)
      } finally {
        isSavingRef.current = false
      }
    }, delay)
  }, [enabled, hasChanges, delay, onSave, cancelSave])

  // Автоматически запускаем сохранение при изменениях
  useEffect(() => {
    if (hasChanges && enabled) {
      triggerSave()
    }

    // Очистка при размонтировании
    return () => {
      cancelSave()
    }
  }, [hasChanges, enabled, triggerSave, cancelSave])

  return {
    triggerSave,
    cancelSave,
  }
}
