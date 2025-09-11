"use client"

import React, { useEffect, useState } from "react"
import { invoiceAPI, type Invoice, type AttendanceStatus, useAttendanceManager } from "@/entities/invoice"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, XCircle, CreditCard, ChevronDown, ChevronRight } from "lucide-react"
import { generateCourseDates, formatAttendanceDate } from "@/shared/lib/attendance-utils"
import { StudentActionsDropdown } from "@/shared/ui/student-actions-dropdown"
import { StudentAttendanceCell } from './StudentAttendanceCell'
import type { Course } from "@/entities/course"

type UserRole = 'Manager' | 'Teacher'

interface DashboardCourseStudentsTableProps {
  course: Course | null
  month?: number
  year?: number
  className?: string
  onStudentDeleted?: () => void
  role?: UserRole
}

export function DashboardCourseStudentsTable({ course, month, year, className, onStudentDeleted, role = 'Manager' }: DashboardCourseStudentsTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Инициализируем attendance manager для всей таблицы
  const attendanceManager = useAttendanceManager({ invoices })

  const loadInvoices = async () => {
    if (!course) {
      setInvoices([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const response = await invoiceAPI.getCourseInvoices(
        course.documentId,
        { month, year }
      )
      
      // Стабильная сортировка студентов по алфавиту (многоязычная)
      const sortedInvoices = response.sort((a, b) => {
        const fullNameA = `${a.family || ''} ${a.name || ''}`.trim()
        const fullNameB = `${b.family || ''} ${b.name || ''}`.trim()
        
        // Используем Intl.Collator для правильной многоязычной сортировки
        return new Intl.Collator(['ru', 'en'], {
          sensitivity: 'base',
          numeric: true,
          ignorePunctuation: true
        }).compare(fullNameA, fullNameB)
      })
      
      setInvoices(sortedInvoices)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке студентов")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [course, month, year])

  const handleStudentDeleted = () => {
    // Перезагружаем список студентов
    loadInvoices()
    // Уведомляем родительский компонент
    onStudentDeleted?.()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentStatusBadge = (invoice: Invoice) => {
    if (invoice.statusPayment) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Оплачен
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <XCircle className="h-3 w-3 mr-1" />
        Не оплачен
      </Badge>
    )
  }

  // Генерируем даты только для выбранного месяца/года
  const courseDates = course ? (() => {
    const currentDate = new Date()
    const targetYear = year || currentDate.getFullYear()
    const targetMonth = month || (currentDate.getMonth() + 1)
    
    // Определяем начало и конец месяца
    const monthStart = new Date(targetYear, targetMonth - 1, 1)
    const monthEnd = new Date(targetYear, targetMonth, 0)
    
    // Определяем реальные границы курса в этом месяце
    const courseStart = new Date(course.startDate)
    const courseEnd = new Date(course.endDate)
    
    // Берем пересечение: максимум из начал и минимум из концов
    const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
    const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))
    
    // Если курс не пересекается с выбранным месяцем
    if (effectiveStart > effectiveEnd) {
      return []
    }
    
    return generateCourseDates(
      effectiveStart.toISOString().split('T')[0],
      effectiveEnd.toISOString().split('T')[0],
      course.weekdays
    )
  })() : []

  // Логика посещаемости перенесена в StudentAttendanceCell

  if (!course) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Студенты курса</CardTitle>
          <CardDescription>
            Выберите курс в таблице выше, чтобы посмотреть список студентов
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Студенты курса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Загрузка студентов...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Студенты курса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSum = invoices.reduce((sum, invoice) => sum + invoice.sum, 0)
  const paidSum = invoices.filter(invoice => invoice.statusPayment).reduce((sum, invoice) => sum + invoice.sum, 0)
  const paidCount = invoices.filter(invoice => invoice.statusPayment).length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          Студенты курса
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>
            Всего записаны: {invoices.length} студентов • 
            Оплатили: {paidCount} студентов
            {attendanceManager.isUpdating && " • 💾 Сохраняется..."}
            {attendanceManager.hasPendingUpdates && " • ⏳ Есть несохраненные изменения"}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            {paidSum}/{totalSum} {course.currency}
          </span>
        </CardDescription>
      </CardHeader>
      
      {invoices.length === 0 ? (
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-600">На этот курс пока никто не записался</p>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Студент</TableHead>
                  {/* Столбцы суммы и оплаты только для менеджеров */}
                  {role === 'Manager' && (
                    <>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус оплаты</TableHead>
                    </>
                  )}
                  {courseDates.map((courseDate, index) => (
                    <TableHead key={index} className="text-center min-w-12">
                      <div className="text-xs">
                        <div>{formatAttendanceDate(courseDate.date)}</div>
                        <div className="text-gray-500">{courseDate.dayName.slice(0, 2)}</div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center w-16">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.documentId} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.name} {invoice.family}</p>
                        {invoice.tinkoffOrderId && (
                          <p className="text-sm text-gray-500">ID: {invoice.tinkoffOrderId}</p>
                        )}
                      </div>
                    </TableCell>
                    {/* Столбцы суммы и оплаты только для менеджеров */}
                    {role === 'Manager' && (
                      <>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{invoice.sum} {invoice.currency}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(invoice)}
                        </TableCell>
                      </>
                    )}
                    {courseDates.map((courseDate, index) => {
                      // Проверяем, входит ли эта дата в персональный период студента
                      const studentStartDate = new Date(invoice.startDate)
                      const studentEndDate = new Date(invoice.endDate)
                      const isInStudentPeriod = courseDate.date >= studentStartDate && courseDate.date <= studentEndDate
                      const dateKey = courseDate.date.toISOString().split('T')[0]
                      
                      return (
                        <TableCell key={index} className="text-center">
                          {isInStudentPeriod ? (
                            <StudentAttendanceCell
                              status={attendanceManager.getAttendanceStatus(invoice.documentId, dateKey)}
                              isPending={attendanceManager.isPending(invoice.documentId, dateKey)}
                              hasError={attendanceManager.hasError(invoice.documentId)}
                              onClick={() => {
                                const currentStatus = attendanceManager.getAttendanceStatus(invoice.documentId, dateKey)
                                let newStatus: AttendanceStatus
                                if (currentStatus === 'unknown') {
                                  newStatus = 'present'
                                } else if (currentStatus === 'present') {
                                  newStatus = 'absent'
                                } else {
                                  newStatus = 'unknown'
                                }
                                attendanceManager.updateAttendance(invoice.documentId, dateKey, newStatus)
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center">
                      <StudentActionsDropdown
                        studentId={invoice.documentId}
                        studentName={invoice.name}
                        studentFamily={invoice.family}
                        invoiceDocumentId={invoice.documentId}
                        courseId={course.documentId}
                        onStudentDeleted={handleStudentDeleted}
                        onStudentUpdated={handleStudentDeleted}
                        role={role}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  )
}