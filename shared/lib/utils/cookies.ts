/**
 * Утилиты для работы с cookies
 * @layer shared
 */

export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

export function getSidebarState(): boolean {
  const savedState = getCookie('sidebar_state')
  return savedState === 'true'
}