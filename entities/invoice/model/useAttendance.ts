"use client"

/**
 * Хук для работы с посещаемостью студентов
 * @layer entities/invoice
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { invoiceAPI, type AttendanceRecord, type AttendanceStatus } from '../api/invoiceApi'
import { useUser } from '@/entities/user'

// Простая реализация debounce без зависимостей
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

interface UseAttendanceOptions {
  invoiceId: string
  initialAttendance?: AttendanceRecord
}

export function useAttendance({ invoiceId, initialAttendance = {} }: UseAttendanceOptions) {
  const { user, token } = useUser()
  const safeInitialAttendance = initialAttendance || {}
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord>(() => safeInitialAttendance)
  const [pendingUpdates, setPendingUpdates] = useState<AttendanceRecord>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref для хранения pending updates для debounce
  const pendingRef = useRef<AttendanceRecord>({})

  // Debounced функция для отправки на сервер
  const debouncedSave = useMemo(
    () => debounce(async (updates: AttendanceRecord) => {
      if (!token || Object.keys(updates).length === 0) return

      try {
        setIsUpdating(true)
        setError(null)
        
        await invoiceAPI.updateAttendance(invoiceId, updates, token)
        
        // Очищаем pending updates после успешного сохранения
        setPendingUpdates(prev => {
          const cleared = { ...prev }
          Object.keys(updates).forEach(date => {
            delete cleared[date]
          })
          return cleared
        })
        pendingRef.current = {}
        
      } catch (err) {
        console.error('Failed to update attendance:', err)
        setError('Ошибка при сохранении посещаемости')
        
        // Rollback optimistic updates при ошибке
        setLocalAttendance(prev => {
          const rolled = { ...prev }
          Object.keys(updates).forEach(date => {
            // Удаляем неудачные изменения, возвращаем к изначальному состоянию
            if (safeInitialAttendance[date]) {
              rolled[date] = safeInitialAttendance[date]
            } else {
              delete rolled[date] // Если не было изначально, удаляем
            }
          })
          return rolled
        })
      } finally {
        setIsUpdating(false)
      }
    }, 500), // 500ms debounce
    [invoiceId, token, initialAttendance]
  )

  // Основная функция для обновления посещаемости
  const updateAttendance = useCallback((date: string, status: AttendanceStatus) => {
    // Optimistic update - мгновенно обновляем UI
    setLocalAttendance(prev => ({ ...prev, [date]: status }))
    
    // Добавляем в pending updates
    const newPending = { ...pendingRef.current, [date]: status }
    pendingRef.current = newPending
    setPendingUpdates(newPending)
    
    // Запускаем debounced save
    debouncedSave(newPending)
  }, [debouncedSave])

  // Получить статус для конкретной даты
  const getAttendanceStatus = useCallback((date: string): AttendanceStatus => {
    return (localAttendance && localAttendance[date]) || 'unknown'
  }, [localAttendance])

  // Проверить есть ли pending изменения для даты
  const isPending = useCallback((date: string): boolean => {
    return pendingUpdates && pendingUpdates.hasOwnProperty(date)
  }, [pendingUpdates])

  // Сохранить изменения при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(pendingRef.current).length > 0) {
        e.preventDefault()
        // Используем sendBeacon для надежной отправки
        const data = JSON.stringify({
          data: { attendance: pendingRef.current }
        })
        navigator.sendBeacon(`/api/invoices/${invoiceId}`, data)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [invoiceId])

  // useEffect удален - используем lazy initialization в useState

  return {
    attendance: localAttendance,
    updateAttendance,
    getAttendanceStatus,
    isPending,
    isUpdating,
    hasPendingUpdates: Object.keys(pendingUpdates).length > 0,
    error
  }
}