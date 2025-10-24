'use client'

/**
 * Компонент для инициализации Mixpanel Analytics
 * @layer shared/components
 */

import { useEffect } from 'react'
import { initMixpanel } from '@/shared/lib/mixpanel'

export function MixpanelInit() {
  useEffect(() => {
    // Инициализируем Mixpanel при монтировании компонента
    initMixpanel()
  }, [])

  // Компонент ничего не рендерит
  return null
}
