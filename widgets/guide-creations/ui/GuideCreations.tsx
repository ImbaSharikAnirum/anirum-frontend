'use client'

/**
 * Виджет отображения креативов по гайду с masonry layout
 * @layer widgets
 */

import { Image } from 'lucide-react'
import { useCreationsByGuide } from '@/entities/creation'
import { MasonryGallery } from '@/shared/ui'
import type { User } from '@/entities/user/model/types'

interface GuideCreationsProps {
  guideId: string
  user?: User | null
}

export function GuideCreations({ guideId, user }: GuideCreationsProps) {
  const { creations, loading, loadingMore, hasMore, loadMore, error } = useCreationsByGuide({
    guideId,
    excludeUserId: user?.documentId
  })

  // Адаптируем Creation под формат Guide для MasonryGallery
  const adaptedCreations = creations.map(creation => ({
    ...creation,
    title: `Креатив от @${creation.users_permissions_user.username}`,
    link: undefined,
    tags: [],
    approved: true
  }))

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {user ? 'Креативы сообщества' : 'Креативы'}
        {!loading && creations.length > 0 && ` (${creations.length})`}
      </h2>

      <MasonryGallery
        items={adaptedCreations as any}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={loadMore}
        type="guides"
        emptyTitle={user ? 'Пока нет креативов от других пользователей' : 'Пока нет креативов'}
        emptyDescription={
          user
            ? 'Здесь будут отображаться креативы других пользователей по этому гайду'
            : 'Загрузите изображения по этому гайду'
        }
        emptyIcon={<Image className="h-12 w-12 mx-auto text-gray-400" />}
      />
    </div>
  )
}
