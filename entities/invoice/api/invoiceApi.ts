/**
 * API для работы с счетами
 * @layer entities/invoice
 */

import { BaseAPI } from '@/shared/api/base'
import type { User } from '@/entities/course/model/types'

export type AttendanceStatus = 'present' | 'absent' | 'unknown'

export type AttendanceRecord = Record<string, AttendanceStatus>

export interface Invoice {
  id: number
  documentId: string
  name: string
  family: string
  sum: number
  currency: string
  startDate: string
  endDate: string
  statusPayment: boolean
  tinkoffOrderId?: string
  paymentId?: string
  paymentDate?: string
  attendance?: AttendanceRecord
  course: {
    id: number
    documentId: string
  }
  owner?: User
  createdAt: string
  updatedAt: string
}

export interface CreateInvoiceData {
  name: string
  family: string
  sum: number
  currency: string
  startDate: string
  endDate: string
  statusPayment: boolean
  course: string // documentId курса
  owner: string // documentId владельца
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

interface StrapiResponse<T> {
  data: T
  meta: {}
}

export class InvoiceAPI extends BaseAPI {
  /**
   * Создать новый счет
   */
  async createInvoice(data: CreateInvoiceData, token: string): Promise<Invoice> {
    const invoiceData = {
      data: {
        name: data.name,
        family: data.family,
        sum: data.sum,
        currency: data.currency,
        startDate: data.startDate,
        endDate: data.endDate,
        statusPayment: data.statusPayment,
        course: data.course,
        owner: data.owner
      }
    }

    return this.request<StrapiResponse<Invoice>>('/invoices', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(invoiceData)
    }).then(response => response.data)
  }

  /**
   * Получить счет по ID
   */
  async getInvoice(id: string, token: string): Promise<Invoice> {
    return this.request<StrapiResponse<Invoice>>(`/invoices/${id}`, {
      headers: this.getAuthHeaders(token),
    }).then(response => response.data)
  }

  /**
   * Получить счет по ID для публичного доступа (без авторизации)
   * Используется для страниц оплаты по ссылке
   */
  async getPublicInvoice(id: string): Promise<Invoice> {
    // Используем правильный Strapi 5 синтаксис для populate
    return this.request<StrapiResponse<Invoice>>(`/invoices/${id}?populate[0]=course&populate[1]=owner`, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.data)
  }

  /**
   * Получить все счета пользователя
   */
  async getMyInvoices(token: string): Promise<Invoice[]> {
    return this.request<{ data: Invoice[] }>('/invoices?populate[course]=*&populate[owner]=*&sort=createdAt:desc', {
      headers: this.getAuthHeaders(token),
    }).then(response => response.data)
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
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

      searchParams.append('filters[startDate][$gte]', startDate);
      searchParams.append('filters[startDate][$lte]', endDate);
    }

    const queryString = searchParams.toString();
    const endpoint = `/invoices?${queryString}`;

    return this.request<{ data: Invoice[] }>(endpoint).then(response => response.data);
  }

  /**
   * Обновить счет
   */
  async updateInvoice(documentId: string, data: UpdateInvoiceData, token: string): Promise<Invoice> {
    const invoiceData = {
      data: {
        ...data
      }
    }

    return this.request<StrapiResponse<Invoice>>(`/invoices/${documentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(invoiceData)
    }).then(response => response.data)
  }

  /**
   * Удалить счет
   */
  async deleteInvoice(documentId: string, token: string): Promise<void> {
    await this.request(`/invoices/${documentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    })
  }

  /**
   * Обновить посещаемость студента
   */
  async updateAttendance(
    invoiceId: string, 
    attendance: AttendanceRecord,
    token: string
  ): Promise<Invoice> {
    return this.request<StrapiResponse<Invoice>>(`/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({
        data: { attendance }
      })
    }).then(response => response.data)
  }

  /**
   * Обновить одну дату посещаемости
   */
  async updateSingleAttendance(
    invoiceId: string,
    date: string,
    status: AttendanceStatus,
    token: string
  ): Promise<Invoice> {
    // Получаем текущую посещаемость
    const invoice = await this.getInvoice(invoiceId, token)
    
    // Мержим с новой датой
    const updatedAttendance = {
      ...(invoice.attendance || {}),
      [date]: status
    }

    return this.updateAttendance(invoiceId, updatedAttendance, token)
  }

  /**
   * Создать платеж через Tinkoff
   */
  async createTinkoffPayment(data: TinkoffPaymentData): Promise<TinkoffPaymentResponse> {
    return this.request<TinkoffPaymentResponse>('/invoices/tinkoff/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }
}

// Экспортируем экземпляр API
export const invoiceAPI = new InvoiceAPI()