/**
 * Конфигурация TanStack Query
 * @layer shared
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Кэшировать данные на 5 минут
      staleTime: 1000 * 60 * 5,
      // Хранить в кэше неиспользуемые данные 10 минут  
      gcTime: 1000 * 60 * 10,
      // Повторные запросы при ошибке
      retry: 1,
      // Refetch при фокусе окна
      refetchOnWindowFocus: false,
    },
  },
})