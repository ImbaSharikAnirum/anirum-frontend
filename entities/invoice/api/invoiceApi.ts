/**
 * API для работы с счетами
 * @layer entities/invoice
 */

import { BaseAPI } from '@/shared/api/base'

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
  course: {
    id: number
    documentId: string
  }
  owner: {
    id: number
    documentId: string
  }
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
    return this.request<StrapiResponse<Invoice>>(`/invoices/${id}?populate=course,owner`, {
      headers: this.getAuthHeaders(token),
    }).then(response => response.data)
  }

  /**
   * Получить все счета пользователя
   */
  async getMyInvoices(token: string): Promise<Invoice[]> {
    return this.request<{ data: Invoice[] }>('/invoices?populate=course,owner&sort=createdAt:desc', {
      headers: this.getAuthHeaders(token),
    }).then(response => response.data)
  }
}

// Экспортируем экземпляр API
export const invoiceAPI = new InvoiceAPI()