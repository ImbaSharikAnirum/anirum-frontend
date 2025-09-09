'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useRole } from "@/shared/hooks"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export interface IncomeCalculatorProps {
  pricePerLesson: number
  minStudents: number
  maxStudents: number
  selectedDays: string[]
  startDate?: Date
  endDate?: Date
  rentalPrice?: number
  currency: string
  isOnline?: boolean
  className?: string
  showCompanyProfit?: boolean
  taxAndCommissionRate?: number // Процент налогов и комиссий (по умолчанию 10%)
}

interface MonthData {
  month: number
  year: number
  monthName: string
  lessonsCount: number
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

const DAY_MAP: Record<string, number> = {
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6
}

export function IncomeCalculator({
  pricePerLesson,
  minStudents,
  maxStudents,
  selectedDays,
  startDate,
  endDate,
  rentalPrice = 0,
  currency,
  isOnline = true,
  className,
  showCompanyProfit = false,
  taxAndCommissionRate = 10
}: IncomeCalculatorProps) {
  const { isManager } = useRole()
  const [showTeacherDetails, setShowTeacherDetails] = useState(false)
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  
  const formatSum = (sum: number) => sum.toLocaleString('ru-RU')
  
  const getCurrencySymbol = (curr: string) => {
    const symbols: Record<string, string> = {
      'USD': '$', 'EUR': '€', 'RUB': '₽', 'KZT': '₸'
    }
    return symbols[curr] || curr
  }

  const currencySymbol = getCurrencySymbol(currency)
  const rent = isOnline ? 0 : rentalPrice

  // Вычисление количества занятий в месяце
  const getLessonsCountForMonth = (month: number, year: number): number => {
    let count = 0
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)
    
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dayName = Object.keys(DAY_MAP).find(key => DAY_MAP[key] === d.getDay())
      if (dayName && selectedDays.includes(dayName)) {
        count++
      }
    }
    return count
  }

  // Получение месяцев в диапазоне
  const monthsData = useMemo((): MonthData[] => {
    if (!startDate || !endDate || selectedDays.length === 0) return []
    
    const months: MonthData[] = []
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const endLimit = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)
    
    while (current <= endLimit) {
      const lessonsCount = getLessonsCountForMonth(current.getMonth(), current.getFullYear())
      if (lessonsCount > 0) {
        months.push({
          month: current.getMonth(),
          year: current.getFullYear(),
          monthName: MONTH_NAMES[current.getMonth()],
          lessonsCount
        })
      }
      current.setMonth(current.getMonth() + 1)
    }
    
    return months
  }, [startDate, endDate, selectedDays])

  const nearestMonth = monthsData[0]
  const nearestLessons = nearestMonth?.lessonsCount || 0

  // Расчеты доходов по новой логике
  const calculateTeacherIncome = (lessons: number, students: number) => {
    const gross = pricePerLesson * lessons * students
    const taxAndCommission = Math.round(gross * (taxAndCommissionRate / 100))
    const afterTax = gross - taxAndCommission
    const rentTotal = rent * lessons
    const net = afterTax - rentTotal
    return Math.round(net * 0.7)
  }

  const calculateCompanyProfit = (lessons: number, students: number) => {
    const gross = pricePerLesson * lessons * students
    const taxAndCommission = Math.round(gross * (taxAndCommissionRate / 100))
    const afterTax = gross - taxAndCommission
    const rentTotal = rent * lessons
    const net = afterTax - rentTotal
    return Math.round(net * 0.3)
  }

  if (!pricePerLesson || !nearestLessons || !minStudents || !maxStudents) {
    return null
  }

  const totalMinIncome = calculateTeacherIncome(nearestLessons, minStudents)
  const totalMaxIncome = calculateTeacherIncome(nearestLessons, maxStudents)
  const totalMinProfit = calculateCompanyProfit(nearestLessons, minStudents)
  const totalMaxProfit = calculateCompanyProfit(nearestLessons, maxStudents)

  const courseCostPerMonth = pricePerLesson * nearestLessons

  return (
    <div className={cn("space-y-4", className)}>
      {/* Стоимость курса для ученика - как в оригинале */}
      <div 
        style={{
          margin: "18px 0 8px 0",
          fontSize: 15,
          color: "#444",
          fontFamily: "Nunito Sans, sans-serif",
        }}
      >
        При такой цене за занятие, ваш курс для ученика будет стоить
        примерно{" "}
        <b>
          {formatSum(courseCostPerMonth)} {currencySymbol}
        </b>{" "}
        за месяц (при {nearestLessons} занятиях)
      </div>
      
      {rent > 0 && (
        <div
          style={{
            margin: "16px 0 8px 0",
            fontSize: 15,
            color: "#444",
            fontFamily: "Nunito Sans, sans-serif",
          }}
        >
          Вы указали аренду{" "}
          <b>
            {formatSum(rent)} {currencySymbol}
          </b>{" "}
          за занятие. При {nearestLessons} занятиях в ближайшем
          месяце это составит{" "}
          <b>
            {formatSum(rent * nearestLessons)} {currencySymbol}
          </b>
          .
        </div>
      )}

      {/* Выплаты преподавателю - стиль как в оригинале */}
      <div
        style={{
          background: "#F7F7F7",
          borderRadius: 16,
          padding: "20px 24px",
          marginTop: 16,
          marginBottom: 0,
          fontSize: 16,
          color: "#222",
          lineHeight: 1.7,
          fontFamily: "Nunito Sans, sans-serif",
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          Ваши выплаты
          {nearestMonth
            ? ` (${nearestMonth.monthName} ${nearestMonth.year})`
            : ""}
          :
        </div>
        <div>
          — минимум (при {minStudents} учениках):{" "}
          <b>
            {formatSum(totalMinIncome)} {currencySymbol}
          </b>
          <br />— максимум (при {maxStudents} учениках):{" "}
          <b>
            {formatSum(totalMaxIncome)} {currencySymbol}
          </b>
        </div>
        <div style={{ fontSize: 14, color: "#888", marginTop: 8 }}>
          📎 Доход - 
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span style={{ cursor: "help" }}>
                  {" "}Сервисные расходы{" "}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p style={{ color: "white" }}>Налоги 6% + Банк 4%{rent > 0 ? ' + Аренда' : ''}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          = Прибыль. Вы получаете 70% от прибыли
        </div>
        <button
          type="button"
          onClick={() => setShowTeacherDetails((v) => !v)}
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: "#1976d2",
            cursor: "pointer",
            fontSize: 15,
            textDecoration: "underline",
            padding: 0,
          }}
        >
          {showTeacherDetails ? "Скрыть подробности" : "Показать выплаты по месяцам"}
        </button>
        {showTeacherDetails && monthsData.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              Выплаты по месяцам:
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  fontSize: 15,
                }}
              >
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    <th
                      style={{
                        padding: "6px 10px",
                        border: "1px solid #e0e0e0",
                        textAlign: "left",
                      }}
                    >
                      Месяц
                    </th>
                    <th
                      style={{ padding: "6px 10px", border: "1px solid #e0e0e0" }}
                    >
                      Занятий
                    </th>
                    <th
                      style={{ padding: "6px 10px", border: "1px solid #e0e0e0" }}
                    >
                      Минимум
                    </th>
                    <th
                      style={{ padding: "6px 10px", border: "1px solid #e0e0e0" }}
                    >
                      Максимум
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthsData.map(({ month, year, monthName, lessonsCount }) => (
                    <tr key={month + "-" + year}>
                      <td
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e0e0e0",
                        }}
                      >
                        {monthName} {year}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e0e0e0",
                          textAlign: "center",
                        }}
                      >
                        {lessonsCount}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e0e0e0",
                          textAlign: "center",
                        }}
                      >
                        {formatSum(calculateTeacherIncome(lessonsCount, minStudents))}{" "}
                        {currencySymbol}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e0e0e0",
                          textAlign: "center",
                        }}
                      >
                        {formatSum(calculateTeacherIncome(lessonsCount, maxStudents))}{" "}
                        {currencySymbol}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Прибыль компании - стиль как в оригинале */}
      {(showCompanyProfit && isManager) && (
        <div
          style={{
            background: "#F7F7F7",
            borderRadius: 16,
            padding: "20px 24px",
            marginTop: 24,
            marginBottom: 0,
            fontSize: 16,
            color: "#222",
            lineHeight: 1.7,
            fontFamily: "Nunito Sans, sans-serif",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            Прибыль компании
            {nearestMonth
              ? ` (${nearestMonth.monthName} ${nearestMonth.year})`
              : ""}
            :
          </div>
          <div>
            — минимум:{" "}
            <b>
              {formatSum(totalMinProfit)} {currencySymbol}
            </b>
            <br />— максимум:{" "}
            <b>
              {formatSum(totalMaxProfit)} {currencySymbol}
            </b>
          </div>
          <div style={{ fontSize: 14, color: "#888", marginTop: 8 }}>
            📎 Доход - 
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span style={{ cursor: "help" }}>
                    {" "}Сервисные расходы{" "}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p style={{ color: "white" }}>Налоги 6% + Банк 4%{rent > 0 ? ' + Аренда' : ''}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            = Прибыль. Компания получает 30% от прибыли
          </div>
          <button
            type="button"
            onClick={() => setShowCompanyDetails((v) => !v)}
            style={{
              marginTop: 12,
              background: "none",
              border: "none",
              color: "#1976d2",
              cursor: "pointer",
              fontSize: 15,
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {showCompanyDetails ? "Скрыть подробности" : "Показать прибыль по месяцам"}
          </button>
          {showCompanyDetails && monthsData.length > 1 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>
                Прибыль по месяцам:
              </div>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    fontSize: 15,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f0f0f0" }}>
                      <th
                        style={{
                          padding: "6px 10px",
                          border: "1px solid #e0e0e0",
                          textAlign: "left",
                        }}
                      >
                        Месяц
                      </th>
                      <th
                        style={{ padding: "6px 10px", border: "1px solid #e0e0e0" }}
                      >
                        Занятий
                      </th>
                      <th
                        style={{ padding: "6px 10px", border: "1px solid #e0e0e0" }}
                      >
                        Минимум компании
                      </th>
                      <th
                        style={{ padding: "6px 10px", border: "1px solid #e0e0e0" }}
                      >
                        Максимум компании
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthsData.map(({ month, year, monthName, lessonsCount }) => (
                      <tr key={month + "-" + year}>
                        <td
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          {monthName} {year}
                        </td>
                        <td
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                          }}
                        >
                          {lessonsCount}
                        </td>
                        <td
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                          }}
                        >
                          {formatSum(calculateCompanyProfit(lessonsCount, minStudents))}{" "}
                          {currencySymbol}
                        </td>
                        <td
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #e0e0e0",
                            textAlign: "center",
                          }}
                        >
                          {formatSum(calculateCompanyProfit(lessonsCount, maxStudents))}{" "}
                          {currencySymbol}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}