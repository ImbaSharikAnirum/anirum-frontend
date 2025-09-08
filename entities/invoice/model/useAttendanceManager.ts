"use client"

/**
 * Хук для управления посещаемостью всей таблицы студентов (батчинг)
 * @layer entities/invoice
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { invoiceAPI, type AttendanceRecord, type AttendanceStatus, type Invoice } from '../api/invoiceApi'
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

interface AttendanceManagerState {
  // Текущее состояние посещаемости всех студентов
  attendance: Record<string, AttendanceRecord> // invoiceId -> { date -> status }
  // Pending обновления для батчинга
  pendingUpdates: Record<string, AttendanceRecord>
  // Глобальные состояния
  isUpdating: boolean
  errors: Record<string, string> // invoiceId -> error message
}

interface UseAttendanceManagerOptions {
  invoices: Invoice[]
}

export function useAttendanceManager({ invoices }: UseAttendanceManagerOptions) {
  const { user, token } = useUser()
  
  // Инициализируем состояние из данных invoices с правильной синхронизацией
  const [state, setState] = useState<AttendanceManagerState>(() => ({
    attendance: invoices.reduce((acc, invoice) => {
      acc[invoice.documentId] = invoice.attendance || {}
      return acc
    }, {} as Record<string, AttendanceRecord>),
    pendingUpdates: {},
    isUpdating: false,
    errors: {}
  }))

  // Синхронизируем состояние при изменении invoices (только базовые данные)
  useEffect(() => {
    setState(prev => ({
      ...prev,
      attendance: invoices.reduce((acc, invoice) => {
        const existingAttendance = prev.attendance[invoice.documentId] || {}
        
        // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: мержим только если нет pending изменений
        // Если есть pending - оставляем текущие изменения как есть
        if (prev.pendingUpdates[invoice.documentId] && Object.keys(prev.pendingUpdates[invoice.documentId]).length > 0) {
          acc[invoice.documentId] = existingAttendance
        } else {
          // Только обновляем базу, если нет pending изменений
          acc[invoice.documentId] = {
            ...(invoice.attendance || {}),
            ...existingAttendance
          }
        }
        return acc
      }, {} as Record<string, AttendanceRecord>)
    }))
  }, [invoices])
  
  // Ref для хранения pending updates для debounce
  const batchRef = useRef<Record<string, AttendanceRecord>>({})

  // Debounced функция для батчинга всех обновлений
  const debouncedBatchSave = useMemo(
    () => debounce(async () => {
      if (!token) {
        return
      }
      
      if (Object.keys(batchRef.current).length === 0) {
        return
      }

      const batch = { ...batchRef.current }

      try {
        setState(prev => ({ ...prev, isUpdating: true, errors: {} }))

        // Отправляем обновления ПОСЛЕДОВАТЕЛЬНО для избежания race conditions
        const results = []
        for (const [invoiceId, newAttendance] of Object.entries(batch)) {
          // Мержим с существующими данными
          const originalInvoice = invoices.find(inv => inv.documentId === invoiceId)
          const existingAttendance = originalInvoice?.attendance || {}
          
          // Объединяем старые данные с новыми изменениями
          const mergedAttendance = {
            ...existingAttendance,
            ...newAttendance
          }
          
          try {
            const result = await invoiceAPI.updateAttendance(invoiceId, mergedAttendance, token)
            results.push({ status: 'fulfilled', value: result })
          } catch (error) {
            results.push({ status: 'rejected', reason: error, invoiceId })
          }
        }
        
        // Обрабатываем ошибки
        const errors: Record<string, string> = {}
        results.forEach((result) => {
          if (result.status === 'rejected' && result.invoiceId) {
            const invoiceId = result.invoiceId
            errors[invoiceId] = 'Ошибка сохранения'
            
            // Rollback для неудачных обновлений - возвращаем к исходным данным
            const originalInvoice = invoices.find(inv => inv.documentId === invoiceId)
            setState(prev => ({
              ...prev,
              attendance: {
                ...prev.attendance,
                [invoiceId]: originalInvoice?.attendance || {}
              }
            }))
          }
        })

        // Очищаем batchRef только после успешной отправки
        batchRef.current = {}
        
        setState(prev => ({
          ...prev,
          pendingUpdates: {},
          errors,
          isUpdating: false
        }))

      } catch (err) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          errors: Object.keys(batch).reduce((acc, invoiceId) => {
            acc[invoiceId] = 'Ошибка сохранения'
            return acc
          }, {} as Record<string, string>)
        }))
      }
    }, 1000), // 1000ms debounce для лучшего батчинга
    [token, invoices]
  )

  // Основная функция для обновления посещаемости
  const updateAttendance = useCallback((
    invoiceId: string,
    date: string,
    status: AttendanceStatus
  ) => {
    // 🚀 Мгновенное optimistic обновление
    setState(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [invoiceId]: {
          ...prev.attendance[invoiceId],
          [date]: status
        }
      },
      pendingUpdates: {
        ...prev.pendingUpdates,
        [invoiceId]: {
          ...prev.pendingUpdates[invoiceId],
          [date]: status
        }
      },
      errors: {
        ...prev.errors,
        [invoiceId]: '' // Очищаем ошибку
      }
    }))

    // Добавляем в батч для отправки - правильно мержим!
    if (!batchRef.current[invoiceId]) {
      batchRef.current[invoiceId] = {}
    }
    // Мержим существующие pending изменения + новое
    batchRef.current[invoiceId] = {
      ...batchRef.current[invoiceId],
      [date]: status
    }

    // Запускаем debounced batch save
    debouncedBatchSave()
  }, [debouncedBatchSave])

  // Получить статус посещаемости для конкретного студента и даты
  const getAttendanceStatus = useCallback((
    invoiceId: string,
    date: string
  ): AttendanceStatus => {
    return state.attendance[invoiceId]?.[date] || 'unknown'
  }, [state.attendance])

  // Проверить есть ли pending обновления для конкретной даты (НЕ блокируем UI!)
  const isPending = useCallback((
    invoiceId: string,
    date: string
  ): boolean => {
    // КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: показываем loading только когда РЕАЛЬНО идет запрос
    // а не когда ждем debounce
    return state.isUpdating && Boolean(state.pendingUpdates[invoiceId]?.[date])
  }, [state.pendingUpdates, state.isUpdating])

  // Проверить есть ли ошибка для студента
  const hasError = useCallback((invoiceId: string): boolean => {
    return Boolean(state.errors[invoiceId])
  }, [state.errors])

  // Получить ошибку для студента
  const getError = useCallback((invoiceId: string): string | null => {
    return state.errors[invoiceId] || null
  }, [state.errors])

  // Сохранение при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(batchRef.current).length > 0) {
        e.preventDefault()
        
        // Отправляем batch через sendBeacon
        const data = JSON.stringify(batchRef.current)
        Object.entries(batchRef.current).forEach(([invoiceId, attendance]) => {
          navigator.sendBeacon(
            `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoiceId}`,
            JSON.stringify({ data: { attendance } })
          )
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return {
    // Основные функции
    updateAttendance,
    getAttendanceStatus,
    
    // Состояния для UI
    isPending,
    hasError,
    getError,
    isUpdating: state.isUpdating,
    
    // Статистика
    totalPendingUpdates: Object.keys(state.pendingUpdates).length,
    hasPendingUpdates: Object.keys(state.pendingUpdates).length > 0
  }
}