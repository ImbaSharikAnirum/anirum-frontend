/**
 * Утилита для выполнения fetch запросов с timeout
 * @layer shared
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeout?: number
}

/**
 * Выполняет fetch с поддержкой timeout
 */
export async function fetchWithTimeout(
  url: string, 
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options
  
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Запрос превысил время ожидания (${timeout}ms)`)
    }
    throw error
  }
}

/**
 * Создает функцию fetch с предустановленным timeout
 */
export function createFetchWithTimeout(defaultTimeout: number = 10000) {
  return (url: string, options: FetchWithTimeoutOptions = {}) => 
    fetchWithTimeout(url, { timeout: defaultTimeout, ...options })
}