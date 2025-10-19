/**
 * Утилита для сохранения и получения последнего открытого дерева навыков
 * @layer shared/lib/storage
 */

const LAST_OPENED_TREE_KEY = 'anirum_last_opened_tree'

/**
 * Получить ID последнего открытого дерева навыков
 */
export function getLastOpenedTree(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem(LAST_OPENED_TREE_KEY)
  } catch (error) {
    console.error('Ошибка чтения последнего дерева из localStorage:', error)
    return null
  }
}

/**
 * Сохранить ID последнего открытого дерева навыков
 */
export function setLastOpenedTree(treeId: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(LAST_OPENED_TREE_KEY, treeId)
  } catch (error) {
    console.error('Ошибка сохранения последнего дерева в localStorage:', error)
  }
}

/**
 * Очистить последнее открытое дерево
 */
export function clearLastOpenedTree(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(LAST_OPENED_TREE_KEY)
  } catch (error) {
    console.error('Ошибка очистки последнего дерева из localStorage:', error)
  }
}
