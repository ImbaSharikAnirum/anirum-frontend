'use client'

/**
 * Хук для управления Pinterest действиями
 * @layer shared/hooks
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useGalleryView } from '@/shared/contexts/GalleryViewContext'
import { pinterestAPI } from '@/entities/pinterest'
import type { User } from '@/entities/user/model/types'

interface PinterestStatus {
  isConnected: boolean
  username?: string
}

interface UsePinterestActionsProps {
  user: User | null | undefined
  initialPinterestStatus: PinterestStatus | null | undefined
}

export function usePinterestActions({ user, initialPinterestStatus }: UsePinterestActionsProps) {
  const [pinterestStatus, setPinterestStatus] = useState(initialPinterestStatus || null)
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()

  // Используем контекст для управления видами галереи
  const { switchToPopular, switchToMyPins, switchToMyGuides, switchToSaved } = useGalleryView()

  // Подключение к Pinterest
  const connectPinterest = () => {
    if (!user) {
      toast.error('Войдите в систему для подключения Pinterest')
      return
    }

    const clientId = process.env.NEXT_PUBLIC_PINTEREST_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_PINTEREST_REDIRECT_URI

    console.log('Pinterest env vars:', { clientId, redirectUri })

    if (!clientId || !redirectUri) {
      const error = 'Не настроены параметры Pinterest OAuth'
      console.error(error)
      toast.error(error)
      return
    }

    try {
      setIsConnecting(true)

      const authUrl = `https://www.pinterest.com/oauth/?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=pins:read,boards:read`

      // Переадресация на Pinterest для авторизации
      // Состояние сбросится автоматически при перезагрузке страницы
      window.location.href = authUrl
    } catch (error) {
      console.error('Ошибка подключения Pinterest:', error)
      toast.error('Не удалось подключиться к Pinterest')
      setIsConnecting(false)
    }
  }

  // Переход к пинам пользователя
  const goToMyPins = () => {
    switchToMyPins()
    toast.success('Переключено на ваши пины')
  }

  // Переход к гайдам пользователя
  const goToMyGuides = () => {
    switchToMyGuides()
    toast.success('Переключено на ваши гайды')
  }

  // Переход к популярным гайдам
  const goToPopular = () => {
    switchToPopular()
    toast.success('Показаны популярные гайды')
  }

  // Переход к сохраненным гайдам
  const goToSaved = () => {
    switchToSaved()
    toast.success('Показаны сохраненные гайды')
  }

  // Переход к созданию гайда
  const goToCreateGuide = () => {
    router.push('/guides/create')
  }

  // Сохранение всех пинов как гайдов (только для менеджеров)
  const saveAllPins = async () => {
    if (!user || user.role?.type !== 'manager') {
      toast.error('Доступно только для менеджеров')
      return
    }

    if (!pinterestStatus?.isConnected) {
      toast.error('Pinterest не подключен')
      return
    }

    try {
      toast.info('Начинается массовое сохранение пинов...', {
        duration: 3000
      })

      const result = await pinterestAPI.saveAllPins()

      // Показываем детальную статистику
      if (result.summary.saved > 0) {
        toast.success(
          `Успешно сохранено ${result.summary.saved} из ${result.summary.total} пинов!`,
          { duration: 5000 }
        )
      }

      if (result.summary.skipped > 0) {
        toast.info(
          `Пропущено ${result.summary.skipped} дубликатов`,
          { duration: 4000 }
        )
      }

      if (result.summary.errors > 0) {
        toast.warning(
          `Ошибок при сохранении: ${result.summary.errors}`,
          { duration: 4000 }
        )
      }

      if (result.summary.saved === 0 && result.summary.total === 0) {
        toast.info('Нет пинов для сохранения')
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
      toast.error(`Ошибка массового сохранения: ${message}`)
      console.error('Save all pins error:', error)
    }
  }

  // Обработчик действий поиска
  const handleSearchAction = (action: string) => {
    switch (action) {
      case 'popular':
        goToPopular()
        break

      case 'saved':
        goToSaved()
        break

      case 'my-guides':
        goToMyGuides()
        break

      case 'my-pins':
        goToMyPins()
        break

      case 'connect-pinterest':
        connectPinterest()
        break

      case 'create-guide':
        goToCreateGuide()
        break

      case 'save-all-pins':
        saveAllPins()
        break

      // case 'disconnect-pinterest':
      //   // TODO: Реализовать через настройки
      //   break

      default:
        console.log('Неизвестное действие:', action)
    }
  }

  // Получаем список доступных действий в зависимости от статуса
  const getQuickActions = () => {
    const actions: Array<{
      icon: string;
      label: string;
      action: string;
      isHeader?: boolean;
    }> = [
      { icon: 'TrendingUp', label: "Популярные", action: "popular" },
      { icon: 'Bookmark', label: "Сохраненные", action: "saved" },
      { icon: 'FileText', label: "Мои гайды", action: "my-guides" },
      { icon: 'PlusCircle', label: "Создать гайд", action: "create-guide" }
    ]

    if (pinterestStatus?.isConnected) {
      // Добавляем заголовок Pinterest
      actions.push({
        icon: '',
        label: "Pinterest",
        action: "header-pinterest",
        isHeader: true
      })

      // Pinterest подключен - показываем "Мои пины"
      actions.push({
        icon: 'Image',
        label: "Мои пины",
        action: "my-pins"
      })

      // Для менеджеров добавляем "Сохранить все пины"
      const isManager = user?.role?.type === 'manager'
      if (isManager) {
        actions.push({
          icon: 'Download',
          label: "Сохранить все пины",
          action: "save-all-pins"
        })
      }
    } else {
      // Pinterest не подключен - показываем "Подключить Pinterest"
      actions.push({
        icon: 'Link2',
        label: "Подключить Pinterest",
        action: "connect-pinterest"
      })
    }

    return actions
  }

  return {
    pinterestStatus,
    isConnecting,
    handleSearchAction,
    getQuickActions,
    connectPinterest,
    goToMyPins
  }
}