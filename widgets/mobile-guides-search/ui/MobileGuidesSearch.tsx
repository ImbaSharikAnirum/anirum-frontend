'use client'

/**
 * Мобильная версия поиска гайдов в полноэкранной модалке
 * @layer widgets
 */

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Clock, Bookmark, FileText, Search, X, ChevronLeft, Link2, Image, TrendingUp, PlusCircle, Download } from "lucide-react"
import { usePinterestActions } from '@/shared/hooks'
import { useGalleryView } from '@/shared/contexts/GalleryViewContext'
import type { User } from '@/entities/user/model/types'

interface PinterestStatus {
  isConnected: boolean
  username?: string
}

interface MobileGuidesSearchProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  pinterestStatus?: PinterestStatus | null | undefined
}

export function MobileGuidesSearch({ isOpen, onClose, user, pinterestStatus }: MobileGuidesSearchProps) {
  const [value, setValue] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Pinterest actions hook
  const { handleSearchAction, getQuickActions } = usePinterestActions({
    user,
    initialPinterestStatus: pinterestStatus || null
  })

  // Gallery view context
  const { switchToSearch, switchToPopular } = useGalleryView()

  // Получаем динамический список действий
  const quickActions = getQuickActions().map(action => ({
    icon: action.icon === 'TrendingUp' ? TrendingUp :
          action.icon === 'Bookmark' ? Bookmark :
          action.icon === 'FileText' ? FileText :
          action.icon === 'Image' ? Image :
          action.icon === 'Link2' ? Link2 :
          action.icon === 'PlusCircle' ? PlusCircle :
          action.icon === 'Download' ? Download : Bookmark,
    label: action.label,
    action: action.action
  }))

  // Загрузка недавних поисков из localStorage при монтировании
  useEffect(() => {
    const stored = localStorage.getItem('guides-recent-searches')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed)
        }
      } catch (error) {
        console.error('Ошибка чтения недавних поисков:', error)
      }
    }
  }, [])

  // Автофокус при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Сохранение недавних поисков в localStorage
  const saveRecentSearches = (searches: string[]) => {
    try {
      localStorage.setItem('guides-recent-searches', JSON.stringify(searches))
      setRecentSearches(searches)
    } catch (error) {
      console.error('Ошибка сохранения недавних поисков:', error)
    }
  }

  // Добавление нового поиска в историю
  const addToRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return

    const newSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm) // убираем дубликаты
    ].slice(0, 3) // ограничиваем до 3 элементов

    saveRecentSearches(newSearches)
  }

  // Фильтрация недавних поисков по введенному тексту
  const filteredSearches = recentSearches.filter(search =>
    search.toLowerCase().includes(value.toLowerCase())
  )

  // 🔍 Debounce: автоматический поиск через 600мс после остановки печати (без скролла)
  useEffect(() => {
    // Если поле очищено - возвращаемся к популярным гайдам БЕЗ скролла
    if (!value.trim()) {
      const timeoutId = setTimeout(() => {
        console.log('🔄 Search cleared (mobile), returning to popular (no scroll)')
        switchToPopular(false) // false = не скроллить
      }, 300)
      return () => clearTimeout(timeoutId)
    }

    const timeoutId = setTimeout(() => {
      console.log('🤖 AI Auto-search triggered (mobile):', value)
      addToRecentSearches(value.trim())
      switchToSearch(value.trim(), [], false) // false = не скроллить при автопоиске
      onClose() // Закрываем модалку после автопоиска
    }, 600) // 600мс задержка

    // Очищаем таймер если пользователь продолжает печатать
    return () => clearTimeout(timeoutId)
  }, [value, switchToSearch, switchToPopular, onClose])

  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue)
    onClose()

    // Запуск поиска БЕЗ скролла (пользователь уже на странице гайдов)
    console.log('Поиск:', selectedValue)
    switchToSearch(selectedValue, [], false)
  }

  const handleActionSelect = (action: string) => {
    onClose()
    handleSearchAction(action)
  }

  // Обработка нажатия Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      addToRecentSearches(value.trim())
      onClose()
      console.log('Поиск по Enter:', value.trim())
      switchToSearch(value.trim(), [], false) // false = не скроллить (уже на странице)
    }
  }

  // Обработка потери фокуса
  const handleBlur = () => {
    // Сохраняем только если поле не пустое и пользователь что-то ввел
    if (value.trim()) {
      addToRecentSearches(value.trim())
    }
  }

  // Очистка поля
  const handleClear = () => {
    setValue("")
    inputRef.current?.focus()
  }

  // Удаление элемента из истории поиска
  const removeFromRecentSearches = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter(search => search !== searchToRemove)
    saveRecentSearches(updatedSearches)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[100vw] h-[100dvh] max-w-none p-0 rounded-none top-0 left-0 transform-none translate-x-0 translate-y-0 inset-0"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        }}
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 border-b bg-background">
            <div className="flex items-center gap-3 px-4 py-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="flex-shrink-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <DialogTitle className="text-lg font-semibold">
                Поиск гайдов
              </DialogTitle>
            </div>

            {/* Search Input */}
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  ref={inputRef}
                  placeholder="Поиск гайдов..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  className="pl-9 pr-10 rounded-full border-2 focus:border-blue-500 focus:ring-0"
                />
                {/* Крестик для очистки - показываем только когда есть текст */}
                {value && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <Command shouldFilter={false} className="h-full">
              <CommandList className="min-h-full text-left p-4 pb-8">
                <CommandEmpty>
                  {value ? `Поиск "${value}"` : "Начните вводить для поиска"}
                </CommandEmpty>

                {/* Показываем недавние поиски только если есть совпадения или поле пустое */}
                {recentSearches.length > 0 && (filteredSearches.length > 0 || !value) && (
                  <CommandGroup heading="Недавние поисковые запросы" className="mb-6">
                    {(value ? filteredSearches : recentSearches.slice(0, 3)).map((search) => (
                      <CommandItem
                        key={search}
                        value={search}
                        onSelect={() => handleSelect(search)}
                        className="flex items-center gap-3 py-3 group rounded-lg"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1">{search}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromRecentSearches(search)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all flex-shrink-0"
                          type="button"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Быстрые действия показываем только когда поле пустое */}
                {!value && (
                  <CommandGroup heading="Интересное" className="mb-6">
                    {quickActions.map((item) => {
                      // Если это заголовок - рендерим как неактивный элемент
                      if (item.action.startsWith('header-')) {
                        return (
                          <div
                            key={item.action}
                            className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
                          >
                            {item.label}
                          </div>
                        )
                      }

                      return (
                        <CommandItem
                          key={item.action}
                          value={item.label}
                          onSelect={() => handleActionSelect(item.action)}
                          className="flex items-center gap-3 py-3 rounded-lg"
                        >
                          <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span>{item.label}</span>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )}

                {/* Если есть текст для поиска, показываем его как опцию */}
                {value && (
                  <CommandGroup heading="Поиск">
                    <CommandItem
                      value={value}
                      onSelect={() => handleSelect(value)}
                      className="flex items-center gap-3 py-3 rounded-lg"
                    >
                      <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>Искать "{value}"</span>
                    </CommandItem>
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}