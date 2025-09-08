"use client"

import React, { useEffect, useState } from "react"
import { invoiceAPI, type Invoice } from "@/entities/invoice/api/invoiceApi"
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
import { generateCourseDates, formatAttendanceDate, getAttendanceStatus, updateAttendanceStatus } from "@/shared/lib/attendance-utils"
import { StudentActionsDropdown } from "@/shared/ui/student-actions-dropdown"
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
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'unknown'>>({})

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
      
      setInvoices(response)
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

  const handleAttendanceToggle = async (studentId: string, date: Date) => {
    const dateKey = `${studentId}-${date.toISOString().split('T')[0]}`
    const currentStatus = attendanceMap[dateKey] || getAttendanceStatus(studentId, date)
    
    // Циклическое переключение: unknown → present → absent → unknown
    let newStatus: 'present' | 'absent' | 'unknown'
    if (currentStatus === 'unknown') {
      newStatus = 'present'
    } else if (currentStatus === 'present') {
      newStatus = 'absent'
    } else {
      newStatus = 'unknown'
    }

    setAttendanceMap(prev => ({
      ...prev,
      [dateKey]: newStatus
    }))

    if (newStatus !== 'unknown') {
      try {
        await updateAttendanceStatus(studentId, date, newStatus)
      } catch (error) {
        setAttendanceMap(prev => ({
          ...prev,
          [dateKey]: currentStatus
        }))
      }
    }
  }

  const getAttendanceIcon = (studentId: string, date: Date) => {
    const dateKey = `${studentId}-${date.toISOString().split('T')[0]}`
    const status = attendanceMap[dateKey] || getAttendanceStatus(studentId, date)
    
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 border border-gray-300 rounded" />
    }
  }

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
          <CardTitle>Студенты курса: {course.description}</CardTitle>
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
          <CardTitle>Студенты курса: {course.description}</CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <span>Студенты курса:</span>
          <span className="text-base font-normal text-gray-600 line-clamp-1">
            {course.description}
          </span>
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>
            Всего записаны: {invoices.length} студентов • 
            Оплатили: {paidCount} студентов
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
                      
                      return (
                        <TableCell key={index} className="text-center">
                          {isInStudentPeriod ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAttendanceToggle(invoice.documentId, courseDate.date)}
                              className="w-8 h-8 p-0 hover:bg-gray-100"
                            >
                              {getAttendanceIcon(invoice.documentId, courseDate.date)}
                            </Button>
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