/**
 * Адаптеры для конвертации типов в унифицированный формат
 * @layer widgets/content-viewer
 */

import type { Guide } from '@/entities/guide/model/types'
import type { PinterestPin } from '@/entities/pinterest/model/types'
import type { UnifiedContent, ContentType } from '../model/types'

type ContentItem = Guide | PinterestPin

export function adaptToUnified(item: ContentItem, type: ContentType): UnifiedContent {
  if (type === 'pin') {
    const pin = item as PinterestPin
    const imageUrl = pin.media?.images?.['1200x']?.url ||
                    pin.media?.images?.['736x']?.url ||
                    Object.values(pin.media?.images || {})[0]?.url || ''

    return {
      id: pin.id,
      title: pin.title || 'Pinterest Pin',
      description: pin.description,
      imageUrl,
      link: pin.link,
      tags: ['pinterest', 'гайд'],
    }
  } else {
    const guide = item as Guide
    return {
      id: guide.documentId,
      title: guide.title,
      description: guide.text,
      imageUrl: guide.image?.url || '',
      link: guide.link,
      tags: guide.tags,
      author: guide.users_permissions_user?.username,
    }
  }
}
