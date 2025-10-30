"use client"

import { useState, useEffect } from "react"
import { useRole } from "@/shared/hooks"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, TrendingUp, Users, CreditCard, Target, User } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PeriodFilter, type PeriodFilterValues } from "@/shared/ui"
import { invoiceAPI, type Invoice } from "@/entities/invoice"
import { courseAPI } from "@/entities/course"
import { generateCourseDates } from "@/shared/lib/attendance-utils"

interface TeacherPaymentBreakdown {
  teacher: {
    documentId: string
    name: string
    family: string
    username: string
  }
  courses: number
  totalRevenue: number
  paidRevenue: number
  totalRent: number
  payment: number
}

export default function ManagerFinancePage() {
  const { isManager, user } = useRole()
  const router = useRouter()

  const currentDate = new Date()
  const [periodFilter, setPeriodFilter] = useState<PeriodFilterValues>({
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  })

  // Состояние для финансовых данных (расширенное)
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    activeCourses: 0,
    averageTicket: 0,
    conversionRate: 0,
    totalStudents: 0,
    paidStudents: 0,
    // Детальные финансы
    totalRent: 0,
    taxUSN: 0, // 6% УСН
    bankCommission: 0, // 4% банк
    taxAndCommission: 0, // общая сумма
    teacherPayments: 0,
    companyProfit: 0
  })
  const [teacherPaymentBreakdown, setTeacherPaymentBreakdown] = useState<TeacherPaymentBreakdown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка финансовых данных с детальными расчетами (как в таблице студентов)
  const loadFinancialData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Получаем все инвойсы за период
      const invoices = await invoiceAPI.getInvoicesForPeriod({
        month: periodFilter.month,
        year: periodFilter.year
      })

      // Отладка: выводим информацию о полученных инвойсах
      console.log('📊 Финансовая аналитика - период:', { month: periodFilter.month, year: periodFilter.year })
      console.log('📋 Получено инвойсов:', invoices.length)
      console.log('💰 Инвойсы:', invoices.map(inv => ({
        name: `${inv.name} ${inv.family}`,
        sum: inv.sum,
        paid: inv.statusPayment,
        startDate: inv.startDate,
        endDate: inv.endDate,
        courseDirection: inv.course?.direction
      })))

      // Подсчитываем базовые метрики
      let totalRevenue = 0
      let paidRevenue = 0
      let totalStudents = 0
      let paidStudents = 0
      const uniqueCourses = new Set()
      let totalRent = 0

      // Группируем инвойсы по курсам для расчета аренды
      const courseInvoices = new Map()
      // Группируем по преподавателям для детализации выплат
      const teacherInvoices = new Map()

      invoices.forEach((invoice: Invoice) => {
        totalStudents++
        totalRevenue += invoice.sum

        if (invoice.statusPayment) {
          paidStudents++
          paidRevenue += invoice.sum
        }

        // Группируем по курсам для расчета аренды
        if (invoice.course?.documentId) {
          uniqueCourses.add(invoice.course.documentId)

          if (!courseInvoices.has(invoice.course.documentId)) {
            courseInvoices.set(invoice.course.documentId, {
              course: invoice.course,
              invoices: []
            })
          }
          courseInvoices.get(invoice.course.documentId).invoices.push(invoice)

          // Группируем по преподавателям
          if (invoice.course?.teacher) {
            const teacherId = invoice.course.teacher.documentId

            if (!teacherInvoices.has(teacherId)) {
              teacherInvoices.set(teacherId, {
                teacher: invoice.course.teacher,
                courses: new Set(),
                invoices: []
              })
            }
            teacherInvoices.get(teacherId).courses.add(invoice.course.documentId)
            teacherInvoices.get(teacherId).invoices.push(invoice)
          }
        }
      })

      // Рассчитываем аренду для каждого курса (как в таблице студентов)
      courseInvoices.forEach((courseData, courseId) => {
        if (!courseData.course?.isOnline && courseData.course?.rentalPrice) {
          // Генерируем даты занятий для данного курса в выбранном периоде
          const currentDate = new Date()
          const targetYear = periodFilter.year || currentDate.getFullYear()
          const targetMonth = periodFilter.month || (currentDate.getMonth() + 1)

          const monthStart = new Date(targetYear, targetMonth - 1, 1)
          const monthEnd = new Date(targetYear, targetMonth, 0)

          const courseStart = new Date(courseData.course?.startDate || new Date())
          const courseEnd = new Date(courseData.course?.endDate || new Date())

          const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
          const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))

          if (effectiveStart <= effectiveEnd) {
            const courseDates = generateCourseDates(
              effectiveStart.toISOString().split('T')[0],
              effectiveEnd.toISOString().split('T')[0],
              courseData.course?.weekdays || []
            )

            const actualLessonsCount = courseDates.length
            const rentForCourse = (courseData.course?.rentalPrice || 0) * actualLessonsCount
            totalRent += rentForCourse
          }
        }
      })

      // Финансовые расчеты (как в таблице студентов)
      const taxUSNRate = 6 // 6% УСН
      const bankCommissionRate = 4 // 4% банк
      const taxAndCommissionRate = 10 // 6% налоги + 4% банк
      const teacherShare = 0.7 // 70% преподавателю

      const calculateTeacherIncome = (grossIncome: number, rentTotal: number = 0) => {
        const taxAndCommission = Math.round(grossIncome * (taxAndCommissionRate / 100))
        const afterTax = grossIncome - taxAndCommission
        const net = afterTax - rentTotal
        return Math.max(0, Math.round(net * teacherShare))
      }

      const calculateCompanyProfit = (grossIncome: number, rentTotal: number = 0) => {
        const taxAndCommission = Math.round(grossIncome * (taxAndCommissionRate / 100))
        const afterTax = grossIncome - taxAndCommission
        const net = afterTax - rentTotal
        return Math.max(0, Math.round(net * (1 - teacherShare)))
      }

      // Расчеты по оплаченным инвойсам
      const taxUSN = Math.round(paidRevenue * (taxUSNRate / 100))
      const bankCommission = Math.round(paidRevenue * (bankCommissionRate / 100))
      const taxAndCommission = taxUSN + bankCommission
      const teacherPayments = calculateTeacherIncome(paidRevenue, totalRent)
      const companyProfit = calculateCompanyProfit(paidRevenue, totalRent)

      // Общие расчеты
      const averageTicket = totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0
      const conversionRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0

      // Расчет выплат по каждому преподавателю
      const teacherBreakdown: TeacherPaymentBreakdown[] = []
      teacherInvoices.forEach((teacherData, teacherId) => {
        // Подсчет доходов преподавателя
        let teacherTotalRevenue = 0
        let teacherPaidRevenue = 0
        teacherData.invoices.forEach((invoice: Invoice) => {
          teacherTotalRevenue += invoice.sum
          if (invoice.statusPayment) {
            teacherPaidRevenue += invoice.sum
          }
        })

        // Расчет аренды для курсов преподавателя
        let teacherRent = 0
        teacherData.courses.forEach((courseId: string) => {
          if (courseInvoices.has(courseId)) {
            const courseData = courseInvoices.get(courseId)
            if (!courseData.course?.isOnline && courseData.course?.rentalPrice) {
              // Генерируем даты занятий для курса
              const currentDate = new Date()
              const targetYear = periodFilter.year || currentDate.getFullYear()
              const targetMonth = periodFilter.month || (currentDate.getMonth() + 1)

              const monthStart = new Date(targetYear, targetMonth - 1, 1)
              const monthEnd = new Date(targetYear, targetMonth, 0)

              const courseStart = new Date(courseData.course?.startDate || new Date())
              const courseEnd = new Date(courseData.course?.endDate || new Date())

              const effectiveStart = new Date(Math.max(monthStart.getTime(), courseStart.getTime()))
              const effectiveEnd = new Date(Math.min(monthEnd.getTime(), courseEnd.getTime()))

              if (effectiveStart <= effectiveEnd) {
                const courseDates = generateCourseDates(
                  effectiveStart.toISOString().split('T')[0],
                  effectiveEnd.toISOString().split('T')[0],
                  courseData.course?.weekdays || []
                )
                const rentForCourse = (courseData.course?.rentalPrice || 0) * courseDates.length
                teacherRent += rentForCourse
              }
            }
          }
        })

        // Расчет выплаты преподавателю
        const teacherPayment = calculateTeacherIncome(teacherPaidRevenue, teacherRent)

        teacherBreakdown.push({
          teacher: teacherData.teacher,
          courses: teacherData.courses.size,
          totalRevenue: Math.round(teacherTotalRevenue),
          paidRevenue: Math.round(teacherPaidRevenue),
          totalRent: Math.round(teacherRent),
          payment: teacherPayment
        })
      })

      // Сортируем по размеру выплаты (по убыванию)
      teacherBreakdown.sort((a, b) => b.payment - a.payment)

      setFinancialData({
        totalRevenue: Math.round(totalRevenue),
        paidRevenue: Math.round(paidRevenue),
        activeCourses: uniqueCourses.size,
        averageTicket,
        conversionRate,
        totalStudents,
        paidStudents,
        totalRent: Math.round(totalRent),
        taxUSN,
        bankCommission,
        taxAndCommission,
        teacherPayments,
        companyProfit
      })

      setTeacherPaymentBreakdown(teacherBreakdown)

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при загрузке финансовых данных")
    } finally {
      setIsLoading(false)
    }
  }

  // Загружаем данные при монтировании и изменении фильтров (как в dashboard-courses-table)
  useEffect(() => {
    loadFinancialData()
  }, [periodFilter.month, periodFilter.year])

  // Проверка доступа только для менеджеров
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Требуется авторизация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Для доступа к этой странице необходимо войти в систему.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/auth/login')} className="flex-1">
                Войти
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                На главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isManager) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Доступ ограничен
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Эта страница доступна только менеджерам.
            </p>
            <p className="text-sm text-gray-500">
              Ваша роль: {user.role?.name || 'Не определена'}
            </p>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Финансовая аналитика</h1>

      {/* Фильтр по периоду */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Период анализа</CardTitle>
        </CardHeader>
        <CardContent>
          <PeriodFilter
            value={periodFilter}
            onPeriodChange={setPeriodFilter}
            showLabels={true}
            className="items-start"
          />
        </CardContent>
      </Card>

      {/* Отображение ошибки (как в dashboard-courses-table) */}
      {error && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button
                onClick={loadFinancialData}
                variant="outline"
                className="mt-4"
              >
                Попробовать снова
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Общий оборот</p>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold">₽ {financialData.paidRevenue.toLocaleString('ru-RU')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Оплаченный оборот</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Активных курсов</p>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold">{financialData.activeCourses}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Курсов в работе</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Средний чек</p>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold">₽ {financialData.averageTicket.toLocaleString('ru-RU')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">На одного студента</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-600">Конверсия</p>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold">{financialData.conversionRate}%</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {isLoading ? 'Загрузка...' : `${financialData.paidStudents}/${financialData.totalStudents} оплатили`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальный финансовый анализ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-red-600">Расходы на аренду</p>
              <Home className="h-4 w-4 text-red-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-red-600">₽ {financialData.totalRent.toLocaleString('ru-RU')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Офлайн курсы</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-orange-600">Налоги и комиссии</p>
              <CreditCard className="h-4 w-4 text-orange-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-orange-600">₽ {financialData.taxAndCommission.toLocaleString('ru-RU')}</p>
              )}
              {!isLoading && (
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>УСН (6%):</span>
                    <span>₽ {financialData.taxUSN.toLocaleString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Банк (4%):</span>
                    <span>₽ {financialData.bankCommission.toLocaleString('ru-RU')}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-600">К выплате преподавателям</p>
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-blue-600">₽ {financialData.teacherPayments.toLocaleString('ru-RU')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">70% после расходов</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-green-600">Прибыль компании</p>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <div className="mt-2">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-green-600">₽ {financialData.companyProfit.toLocaleString('ru-RU')}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">30% после расходов</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Подробная информация */}
      <Card>
        <CardHeader>
          <CardTitle>Детальная статистика</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>Период:</strong> {periodFilter.month ? `Месяц ${periodFilter.month}` : 'Все месяцы'}, {periodFilter.year || 'Все годы'}
              </p>
              <p className="text-gray-600">
                <strong>Всего записалось:</strong> {financialData.totalStudents} студентов
              </p>
              <p className="text-gray-600">
                <strong>Оплатили:</strong> {financialData.paidStudents} студентов ({financialData.conversionRate}%)
              </p>
              <p className="text-gray-600">
                <strong>Активных курсов:</strong> {financialData.activeCourses}
              </p>

              {/* Финансовый breakdown */}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-800">Финансовый анализ</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Валовый оборот</p>
                    <p className="font-medium">₽ {financialData.totalRevenue.toLocaleString('ru-RU')}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">Оплачено</p>
                    <p className="font-medium text-green-800">₽ {financialData.paidRevenue.toLocaleString('ru-RU')}</p>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-600 mb-2">Распределение оплаченного оборота:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-red-600">- Аренда:</span>
                      <span className="font-medium">₽ {financialData.totalRent.toLocaleString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">- УСН (6%):</span>
                      <span className="font-medium">₽ {financialData.taxUSN.toLocaleString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-600">- Банковские комиссии (4%):</span>
                      <span className="font-medium">₽ {financialData.bankCommission.toLocaleString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-600">Остается к распределению:</span>
                      <span className="font-medium">₽ {(financialData.paidRevenue - financialData.totalRent - financialData.taxAndCommission).toLocaleString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between ml-4">
                      <span className="text-blue-600">→ Преподавателям (70%):</span>
                      <span className="font-medium text-blue-600">₽ {financialData.teacherPayments.toLocaleString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between ml-4">
                      <span className="text-green-600">→ Компании (30%):</span>
                      <span className="font-medium text-green-600">₽ {financialData.companyProfit.toLocaleString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблица выплат преподавателям */}
      {!isLoading && teacherPaymentBreakdown.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Выплаты преподавателям
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Преподаватель</TableHead>
                    <TableHead className="text-center">Курсов</TableHead>
                    <TableHead className="text-right">Валовый доход</TableHead>
                    <TableHead className="text-right">Оплачено</TableHead>
                    <TableHead className="text-right">Аренда</TableHead>
                    <TableHead className="text-right font-medium">К выплате</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherPaymentBreakdown.map((teacher, index) => (
                    <TableRow key={teacher.teacher.documentId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{teacher.teacher.name} {teacher.teacher.family}</p>
                          <p className="text-sm text-gray-500">@{teacher.teacher.username}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{teacher.courses}</TableCell>
                      <TableCell className="text-right">₽ {teacher.totalRevenue.toLocaleString('ru-RU')}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ₽ {teacher.paidRevenue.toLocaleString('ru-RU')}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {teacher.totalRent > 0 ? `-₽ ${teacher.totalRent.toLocaleString('ru-RU')}` : '₽ 0'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-blue-600">
                          ₽ {teacher.payment.toLocaleString('ru-RU')}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Итоговая строка */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-800">
                  Итого к выплате всем преподавателям:
                </span>
                <span className="text-lg font-bold text-blue-800">
                  ₽ {teacherPaymentBreakdown.reduce((sum, teacher) => sum + teacher.payment, 0).toLocaleString('ru-RU')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}