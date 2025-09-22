'use client'

/**
 * Поисковая панель для страницы гайдов с мобильной поддержкой
 * @layer widgets
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { GuidesSearch } from '@/widgets/guides-search'
import { MobileGuidesSearch } from '@/widgets/mobile-guides-search'
import type { User } from '@/entities/user/model/types'

interface PinterestStatus {
  isConnected: boolean
  username?: string
}

interface GuidesSearchBarProps {
  user?: User | null
  pinterestStatus?: PinterestStatus | null
}

export function GuidesSearchBar({ user, pinterestStatus }: GuidesSearchBarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  return (
    <>
      {/* Десктоп версия */}
      <div className="hidden md:block w-full max-w-md">
        <GuidesSearch user={user} pinterestStatus={pinterestStatus} />
      </div>

      {/* Мобильная версия - кнопка */}
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsMobileSearchOpen(true)}
        className="md:hidden w-full max-w-sm flex items-center gap-2 text-muted-foreground"
      >
        <Search className="h-4 w-4" />
        <span>Поиск гайдов...</span>
      </Button>

      {/* Мобильная модалка */}
      <MobileGuidesSearch
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        user={user}
        pinterestStatus={pinterestStatus}
      />
    </>
  )
}