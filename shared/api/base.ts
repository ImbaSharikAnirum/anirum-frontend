/**
 * Базовый HTTP клиент для взаимодействия с API
 * @layer shared
 */

export interface APIError {
  message: string
  status: number
  details?: any
}

export interface RequestOptions extends RequestInit {
  timeout?: number
}

export class BaseAPI {
  protected baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://anirum.up.railway.app/api'
  }

  protected async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Создаем AbortController для timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000) // 10 секунд по умолчанию
    
    const config: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)
      return await this.handleResponse<T>(response)
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new APIError({
          message: 'Запрос превысил время ожидания',
          status: 408,
          details: { timeout: options.timeout || 10000 }
        })
      }
      throw error
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new APIError({
        message: error.error?.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        details: error
      })
    }

    // Проверяем, есть ли контент для парсинга
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type')
    
    // Если нет контента или это не JSON, возвращаем undefined
    if (contentLength === '0' || response.status === 204 || !contentType?.includes('application/json')) {
      return undefined as T
    }

    return response.json()
  }

  protected getAuthHeaders(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`
    }
  }
}

export class APIError extends Error {
  public status: number
  public details?: any

  constructor({ message, status, details }: { message: string, status: number, details?: any }) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.details = details
  }
}