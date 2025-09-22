'use client'

/**
 * Виджет поиска гайдов в стиле Pinterest
 * @layer widgets
 */

import { useState, useRef, useEffect } from 'react'
import { Command, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Clock, Bookmark, FileText, Search, X, Link2, Image, TrendingUp, PlusCircle } from "lucide-react"
import { usePinterestActions } from '@/shared/hooks'
import { useGalleryView } from '@/shared/contexts/GalleryViewContext'
import type { User } from '@/entities/user/model/types'

interface PinterestStatus {
  isConnected: boolean
  username?: string
}

interface GuidesSearchProps {
  user?: User | null
  pinterestStatus?: PinterestStatus | null | undefined
}

export function GuidesSearch({ user, pinterestStatus }: GuidesSearchProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Pinterest actions hook
  const { handleSearchAction, getQuickActions } = usePinterestActions({
    user,
    initialPinterestStatus: pinterestStatus || null
  })

  // Gallery view context
  const { switchToSearch } = useGalleryView()

  // Получаем динамический список действий
  const quickActions = getQuickActions().map(action => ({
    icon: action.icon === 'TrendingUp' ? TrendingUp :
          action.icon === 'Bookmark' ? Bookmark :
          action.icon === 'FileText' ? FileText :
          action.icon === 'Image' ? Image :
          action.icon === 'Link2' ? Link2 :
          action.icon === 'PlusCircle' ? PlusCircle : Bookmark,
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

  // Правильная обработка кликов вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputFocus = () => {
    setOpen(true)
  }

  const handleInputClick = () => {
    setOpen(true)
    // Принудительно фокусируем input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  const handleSelect = (selectedValue: string) => {
    setValue(selectedValue)
    setOpen(false)
    inputRef.current?.blur()

    // Запуск поиска
    console.log('Поиск:', selectedValue)
    switchToSearch(selectedValue)
  }

  const handleActionSelect = (action: string) => {
    setOpen(false)
    inputRef.current?.blur()
    handleSearchAction(action)
  }

  // Обработка нажатия Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      addToRecentSearches(value.trim())
      setOpen(false)
      inputRef.current?.blur()
      console.log('Поиск по Enter:', value.trim())
      switchToSearch(value.trim())
    }
  }

  // Обработка потери фокуса
  const handleBlur = () => {
    // Сохраняем только если поле не пустое и пользователь что-то ввел
    if (value.trim()) {
      addToRecentSearches(value.trim())
    }
    // Небольшая задержка чтобы не закрывать dropdown при клике на элемент
    setTimeout(() => setOpen(false), 150)
  }

  // Очистка поля
  const handleClear = () => {
    setValue("")
    setOpen(false)
    inputRef.current?.blur()
  }

  // Удаление элемента из истории поиска
  const removeFromRecentSearches = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter(search => search !== searchToRemove)
    saveRecentSearches(updatedSearches)
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          placeholder="Поиск гайдов..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
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

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 w-full mt-2 bg-popover text-popover-foreground rounded-md border shadow-md">
          <Command shouldFilter={false}>
            <CommandList className="max-h-[300px] text-left">
              <CommandEmpty>
                {value ? `Поиск "${value}"` : "Начните вводить для поиска"}
              </CommandEmpty>

              {/* Показываем недавние поиски только если есть совпадения или поле пустое */}
              {recentSearches.length > 0 && (filteredSearches.length > 0 || !value) && (
                <CommandGroup heading="Недавние поисковые запросы">
                  {(value ? filteredSearches : recentSearches.slice(0, 3)).map((search) => (
                    <CommandItem
                      key={search}
                      value={search}
                      onSelect={() => handleSelect(search)}
                      className="flex items-center gap-2 py-2 group"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{search}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromRecentSearches(search)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-accent rounded transition-all"
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
                <CommandGroup heading="Интересное">
                  {quickActions.map((item) => (
                    <CommandItem
                      key={item.action}
                      value={item.label}
                      onSelect={() => handleActionSelect(item.action)}
                      className="flex items-center gap-2 py-2"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Если есть текст для поиска, показываем его как опцию */}
              {value && (
                <CommandGroup heading="Поиск">
                  <CommandItem
                    value={value}
                    onSelect={() => handleSelect(value)}
                    className="flex items-center gap-2 py-2"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span>Искать "{value}"</span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}