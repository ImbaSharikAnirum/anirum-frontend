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
  tinkoffOrderId?: string
  paymentId?: string
  paymentDate?: string
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