/**
 * Хук для сохранения/удаления гайдов из избранного
 * @layer entities
 */

import { useState } from 'react'
import { toast } from 'sonner'
import { guideAPI } from '../api/guideApi'
import type { Guide } from './types'

export function useGuideSave() {
  const [savingGuides, setSavingGuides] = useState<Set<string>>(new Set())

  const toggleSave = async (guide: Guide, userId: string | undefined) => {
    if (!userId) {
      throw new Error('User ID is required')
    }
    const guideId = guide.documentId

    if (savingGuides.has(guideId)) {
      return // Уже сохраняется
    }

    try {
      setSavingGuides(prev => new Set(prev).add(guideId))

      // Проверяем, сохранен ли гайд пользователем
      const isSaved = guide.savedBy?.some(user => user.id === userId)
      const action = isSaved ? 'unsave' : 'save'

      await guideAPI.toggleSave(guideId, { action })

      toast.success(
        action === 'save'
          ? 'Гайд добавлен в сохраненные'
          : 'Гайд удален из сохраненных'
      )

      return action

    } catch (error) {
      console.error('Ошибка при сохранении гайда:', error)
      toast.error('Не удалось сохранить гайд')
      throw error

    } finally {
      setSavingGuides(prev => {
        const newSet = new Set(prev)
        newSet.delete(guideId)
        return newSet
      })
    }
  }

  return {
    savingGuides,
    toggleSave
  }
}