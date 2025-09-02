/**
 * Базовый HTTP клиент для взаимодействия с API
 * @layer shared
 */

export interface APIError {
  message: string
  status: number
  details?: any
}

export class BaseAPI {
  protected baseURL: string

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://anirum.up.railway.app/api'
    
    // Debug: показываем какой URL используется
    if (process.env.NODE_ENV === 'development') {
      console.log('API Base URL:', this.baseURL)
      console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    }
  }

  protected async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new APIError({
        message: error.error?.message || `HTTP error! status: ${response.status}`,
        status: response.status,
        details: error
      })
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