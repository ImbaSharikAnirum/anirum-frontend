/**
 * API для работы с счетами
 * @layer entities/invoice
 */

import { BaseAPI } from '@/shared/api/base'
import type { User, Course } from '@/entities/course/model/types'

export type AttendanceStatus = 'present' | 'absent' | 'unknown'

export type AttendanceRecord = Record<string, AttendanceStatus>

export interface Invoice {
  id: number
  documentId: string
  name: string
  family: string
  sum: number
  originalSum?: number
  discountAmount?: number
  bonusesUsed?: number
  currency: string
  startDate: string
  endDate: string
  statusPayment: boolean
  tinkoffOrderId?: string
  paymentId?: string
  paymentDate?: string
  attendance?: AttendanceRecord
  course: Course
  owner?: User
  referralCode?: {
    id: number
    documentId: string
    code: string
  }
  referrer?: User
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceData {
  name: string
  family: string
  sum: number
  originalSum?: number
  discountAmount?: number
  bonusesUsed?: number
  currency: string
  startDate: string
  endDate: string
  statusPayment: boolean
  course: string // documentId курса
  owner: string // documentId владельца
  referralCode?: string | number // documentId реферального кода
  referrer?: string | number // documentId реферера
}

export interface UpdateInvoiceData {
  name?: string
  family?: string
  sum?: number
  currency?: string
  startDate?: string
  endDate?: string
  statusPayment?: boolean
  // НЕ включаем course и owner для обновления
}

export interface TinkoffPaymentData {
  users_permissions_user?: string // documentId пользователя
  student?: string // documentId студента (если есть)
  course: string // documentId курса (обязательно)
  amount: number
  currency: string
  invoiceId?: string // documentId созданного invoice
}

export interface TinkoffPaymentResponse {
  paymentUrl: string
  orderId: string
  message: string
}

export interface SendPaymentMessageData {
  invoiceDocumentId: string
  courseId: string
}

export interface SendPaymentMessageResponse {
  success: boolean
  message: string
  messenger: 'whatsapp' | 'telegram'
}

export interface BulkSendPaymentMessagesData {
  courseId: string
  month?: number
  year?: number
}

export interface BulkSendPaymentMessagesResponse {
  success: boolean
  message: string
  results: {
    total: number
    sent: number
    failed: number
    details: Array<{
      studentName: string
      success: boolean
      messenger?: 'whatsapp' | 'telegram'
      error?: string
    }>
  }
}

export interface CopyInvoicesToNextMonthData {
  courseId: string
  currentMonth: number
  currentYear: number
}

export interface CopyInvoicesToNextMonthResponse {
  success: boolean
  message: string
  results: {
    originalCount: number
    copiedCount: number
    nextMonth: number
    nextYear: number
    lessonsCount: number
    monthlySum: number
    pricePerLesson: number
    currency: string
    newInvoices: Invoice[]
  }
}

export class InvoiceAPI extends BaseAPI {
  /**
   * Создать новый счет
   */
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const invoiceData = {
      data: {
        name: data.name,
        family: data.family,
        sum: data.sum,
        originalSum: data.originalSum,
        discountAmount: data.discountAmount,
        bonusesUsed: data.bonusesUsed,
        currency: data.currency,
        startDate: data.startDate,
        endDate: data.endDate,
        statusPayment: data.statusPayment,
        course: data.course,
        owner: data.owner,
        referralCode: data.referralCode,
        referrer: data.referrer
      }
    }

    const response = await fetch('/api/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create invoice')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * Получить счет по ID
   */
  async getInvoice(id: string): Promise<Invoice> {
    const response = await fetch(`/api/invoices/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch invoice')
    }
    
    const result = await response.json()
    return result.data
  }

  /**
   * Получить счет по ID для публичного доступа (без авторизации)
   * Используется для страниц оплаты по ссылке
   */
  async getPublicInvoice(id: string): Promise<Invoice> {
    // Используем правильный Strapi 5 синтаксис для populate
    const response = await fetch(`/api/invoices/${id}?populate[0]=course&populate[1]=owner`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch public invoice')
    }
    
    const result = await response.json()
    return result.data
  }

  /**
   * Получить счет по tinkoffOrderId для публичного доступа
   * Используется на странице success после оплаты
   */
  async getInvoiceByTinkoffOrderId(tinkoffOrderId: string): Promise<Invoice | null> {
    try {
      const response = await fetch(`/api/invoices?filters[tinkoffOrderId][$eq]=${tinkoffOrderId}&populate[0]=course&populate[1]=owner`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice by tinkoffOrderId')
      }
      
      const result = await response.json()
      return result.data && result.data.length > 0 ? result.data[0] : null
    } catch (error) {
      console.error('Ошибка получения invoice по tinkoffOrderId:', error)
      return null
    }
  }

  /**
   * Получить все счета пользователя
   */
  async getMyInvoices(): Promise<Invoice[]> {
    const response = await fetch('/api/invoices?populate[course]=*&populate[owner]=*&sort=createdAt:desc')
    
    if (!response.ok) {
      throw new Error('Failed to fetch my invoices')
    }
    
    const result = await response.json()
    return result.data
  }

  /**
   * Получить инвойсы конкретного курса за определенный период
   */
  async getCourseInvoices(
    courseDocumentId: string,
    filters?: {
      month?: number;
      year?: number;
    }
  ): Promise<Invoice[]> {
    const searchParams = new URLSearchParams();

    // Фильтр по курсу
    searchParams.append('filters[course][documentId][$eq]', courseDocumentId);

    // Добавляем фильтрацию по датам если указаны
    if (filters && (filters.month || filters.year)) {
      const year = filters.year || new Date().getFullYear();
      const month = filters.month || new Date().getMonth() + 1;

      // Формируем диапазон дат для месяца
      const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const monthEnd = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      // Инвойсы создаются помесячно (startDate и endDate в пределах одного месяца)
      // Фильтруем: startDate начинается в выбранном месяце
      searchParams.append('filters[startDate][$gte]', monthStart);
      searchParams.append('filters[startDate][$lte]', monthEnd);
    }

    // Добавляем populate для owner, чтобы получить информацию о мессенджерах
    searchParams.append('populate[0]', 'owner');

    const queryString = searchParams.toString();
    const response = await fetch(`/api/invoices?${queryString}`);

    if (!response.ok) {
      throw new Error('Failed to fetch course invoices')
    }

    const result = await response.json()
    return result.data;
  }

  /**
   * Получить все инвойсы за период для финансовой аналитики
   */
  async getInvoicesForPeriod(filters?: {
    month?: number;
    year?: number;
  }): Promise<Invoice[]> {
    const searchParams = new URLSearchParams();

    // Популируем курс с преподавателем для получения полной информации
    searchParams.append('populate[0]', 'course');
    searchParams.append('populate[1]', 'course.teacher');

    // Добавляем фильтрацию по датам если указаны
    if (filters && (filters.month || filters.year)) {
      const year = filters.year || new Date().getFullYear();
      const month = filters.month || new Date().getMonth() + 1;

      // Формируем диапазон дат для месяца
      const monthStart = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const monthEnd = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      // Инвойсы создаются помесячно (startDate и endDate в пределах одного месяца)
      // Фильтруем: startDate начинается в выбранном месяце
      searchParams.append('filters[startDate][$gte]', monthStart);
      searchParams.append('filters[startDate][$lte]', monthEnd);
    }

    const queryString = searchParams.toString();
    const url = `/api/invoices?${queryString}`;

    console.log('🔍 getInvoicesForPeriod - запрос:', url)

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response:', response.status, errorData);
      throw new Error(`Failed to fetch invoices for period: ${response.status} ${errorData}`)
    }

    const result = await response.json()
    return result.data;
  }

  /**
   * Обновить счет
   */
  async updateInvoice(documentId: string, data: UpdateInvoiceData): Promise<Invoice> {
    const invoiceData = {
      data: {
        ...data
      }
    }

    const response = await fetch(`/api/invoices/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to update invoice')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * Удалить счет
   */
  async deleteInvoice(documentId: string): Promise<void> {
    const response = await fetch(`/api/invoices/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Failed to delete invoice')
    }
  }

  /**
   * Обновить посещаемость студента
   */
  async updateAttendance(
    invoiceId: string, 
    attendance: AttendanceRecord
  ): Promise<Invoice> {
    const response = await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { attendance }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to update attendance')
    }

    const result = await response.json()
    return result.data
  }

  /**
   * Обновить одну дату посещаемости
   */
  async updateSingleAttendance(
    invoiceId: string,
    date: string,
    status: AttendanceStatus
  ): Promise<Invoice> {
    // Получаем текущую посещаемость
    const invoice = await this.getInvoice(invoiceId)
    
    // Мержим с новой датой
    const updatedAttendance = {
      ...(invoice.attendance || {}),
      [date]: status
    }

    return this.updateAttendance(invoiceId, updatedAttendance)
  }

  /**
   * Создать платеж через Tinkoff
   */
  async createTinkoffPayment(data: TinkoffPaymentData): Promise<TinkoffPaymentResponse> {
    const response = await fetch('/api/invoices/tinkoff/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create Tinkoff payment')
    }

    return response.json()
  }

  /**
   * Отправить сообщение с оплатой в мессенджер
   */
  async sendPaymentMessage(data: SendPaymentMessageData): Promise<SendPaymentMessageResponse> {
    const response = await fetch('/api/invoices/send-payment-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to send payment message')
    }

    return response.json()
  }

  /**
   * Массовая отправка сообщений с оплатой всем студентам курса
   */
  async bulkSendPaymentMessages(data: BulkSendPaymentMessagesData): Promise<BulkSendPaymentMessagesResponse> {
    const response = await fetch('/api/invoices/bulk-send-payment-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to send bulk payment messages')
    }

    return response.json()
  }

  /**
   * Копировать счета текущего месяца на следующий месяц
   */
  async copyInvoicesToNextMonth(data: CopyInvoicesToNextMonthData): Promise<CopyInvoicesToNextMonthResponse> {
    const response = await fetch('/api/invoices/copy-to-next-month', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to copy invoices to next month')
    }

    return response.json()
  }
}

// Экспортируем экземпляр API
export const invoiceAPI = new InvoiceAPI()