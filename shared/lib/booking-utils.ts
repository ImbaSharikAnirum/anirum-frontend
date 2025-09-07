/**
 * Утилиты для работы с бронированием курсов
 * @layer shared
 */

import { Course } from '@/entities/course/model/types'
import { Invoice } from '@/entities/invoice'

/**
 * Фильтрует инвойсы курса по конкретному месяцу
 */
export function getInvoicesForMonth(
  invoices: Invoice[] | undefined,
  year: number,
  month: number // 1-12
): Invoice[] {
  if (!invoices || invoices.length === 0) {
    return []
  }

  return invoices.filter(invoice => {
    if (!invoice.startDate) return false
    
    const invoiceDate = new Date(invoice.startDate)
    const invoiceYear = invoiceDate.getFullYear()
    const invoiceMonth = invoiceDate.getMonth() + 1 // getMonth() returns 0-11
    
    return invoiceYear === year && invoiceMonth === month
  })
}

/**
 * Проверяет, можно ли сразу оплачивать курс без подтверждения менеджера
 * на основе количества существующих бронирований на месяц
 */
export function canDirectPayment(
  course: Course, 
  monthlyInvoices: Invoice[]
): boolean {
  const minStudents = course.minStudents
  const currentInvoiceCount = monthlyInvoices.length
  
  // Если minStudents равно 1 ИЛИ текущее количество бронирований >= minStudents
  return minStudents === 1 || currentInvoiceCount >= minStudents
}