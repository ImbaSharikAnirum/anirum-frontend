"use client"

import { useEffect, useState } from "react"
import { courseAPI } from "@/entities/course"
import type { Course } from "@/entities/course"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, MoreHorizontal } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useUserTimezone } from "@/shared/hooks/useUserTimezone"
import { formatCourseSchedule } from "@/shared/lib/timezone-utils"
import { formatWeekdays } from "@/shared/lib/course-utils"
import { CourseEnrollmentProgress } from "@/shared/ui/course-enrollment-progress"
import type { ManagerCoursesFilterValues } from "@/widgets/manager-courses-filters"

interface ManagerCoursesTableProps {
  className?: string
  filters?: ManagerCoursesFilterValues
  onCourseSelect?: (course: Course | null) => void
  selectedCourse?: Course | null
  refreshKey?: number
}

export function ManagerCoursesTable({ className, filters, onCourseSelect, selectedCourse, refreshKey }: ManagerCoursesTableProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)
  const pageSize = 5
  const { timezone: userTimezone, loading: timezoneLoading } = useUserTimezone()

  // Сбрасываем страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  useEffect(() => {
    async function loadCourses() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Построение фильтров для API
        const apiFilters: Record<string, any> = {
          status: { $eq: 'pending_approval' }
        }
        
        // Фильтр по преподавателю
        if (filters?.teacher) {
          apiFilters.teacher = { documentId: { $eq: filters.teacher } }
        }
        
        // Фильтр по формату
        if (filters?.format) {
          apiFilters.isOnline = { $eq: filters.format === 'online' }
        }
        
        // Фильтр по дате (месяц и год)
        if (filters?.year || filters?.month) {
          const year = filters.year || new Date().getFullYear()
          
          if (filters.month) {
            // Конкретный месяц
            const startDate = `${year}-${filters.month.toString().padStart(2, '0')}-01`
            const lastDay = new Date(year, filters.month, 0).getDate()
            const endDate = `${year}-${filters.month.toString().padStart(2, '0')}-${lastDay}`
            
            // Курсы, которые проходят в этом месяце
            apiFilters.$or = [
              {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
              }
            ]
          } else {
            // Только год
            const startDate = `${year}-01-01`
            const endDate = `${year}-12-31`
            
            apiFilters.$or = [
              {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
              }
            ]
          }
        }
        
        // Определяем параметры для фильтрации инвойсов
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth() + 1 // getMonth() возвращает 0-11, нужно 1-12
        
        const invoicesMonth = filters?.month || currentMonth
        const invoicesYear = filters?.year || currentYear
        
        const response = await courseAPI.getCourses({
          page: currentPage,
          pageSize: pageSize,
          filters: apiFilters,
          populate: ["images", "teacher.avatar", "invoices"],
          sort: ["createdAt:desc"],
          // Передаем параметры для фильтрации инвойсов по выбранному/текущему месяцу
          invoicesMonth: invoicesMonth,
          invoicesYear: invoicesYear
        })
        
        setCourses(response.courses)
        
        // Обновляем метаданные пагинации
        if (response.meta?.pagination) {
          setTotalPages(response.meta.pagination.pageCount)
          setTotalCourses(response.meta.pagination.total)
        } else {
          // Если Strapi не возвращает meta, рассчитываем сами
          setTotalCourses(response.courses.length)
          setTotalPages(Math.ceil(response.courses.length / pageSize))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка при загрузке курсов")
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [filters, refreshKey, currentPage])

  const handleActions = async (courseId: string) => {
    // TODO: Реализовать меню действий (одобрить/отклонить/просмотреть)
    console.log("Действия для курса:", courseId)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Показываем страницы с многоточием
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, -1, totalPages) // -1 означает многоточие
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages)
      }
    }
    
    return pages
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatSchedule = (startTime: string, endTime: string, courseTimezone: string) => {
    if (timezoneLoading) {
      return {
        timeRange: `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`,
        timezone: courseTimezone,
        isConverted: false
      }
    }

    return formatCourseSchedule(
      startTime,
      endTime,
      courseTimezone,
      userTimezone
    )
  }

  const getDirectionLabel = (direction: string) => {
    const labels = {
      'sketching': 'Скетчинг',
      'drawing2d': '2D Рисование',
      'animation': 'Анимация',
      'modeling3d': '3D Моделирование'
    }
    return labels[direction as keyof typeof labels] || direction
  }

  const getComplexityLabel = (complexity: string) => {
    const labels = {
      'beginner': 'Начинающий',
      'experienced': 'Опытный',
      'professional': 'Профессионал'
    }
    return labels[complexity as keyof typeof labels] || complexity
  }

  const getCourseTypeLabel = (courseType: string) => {
    const labels = {
      'club': 'Кружок',
      'course': 'Курс',
      'intensive': 'Интенсив',
      'individual': 'Индивидуальный'
    }
    return labels[courseType as keyof typeof labels] || courseType
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Загрузка курсов...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-4"
        >
          Попробовать снова
        </Button>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Нет курсов на проверку</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Преподаватель</TableHead>
              <TableHead>Направление</TableHead>
              <TableHead>Дни недели</TableHead>
              <TableHead>Время</TableHead>
              <TableHead>Местоположение</TableHead>
              <TableHead>Участники</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => {
              const schedule = formatSchedule(course.startTime, course.endTime, course.timezone)
              const displayTimezone = schedule.isConverted ? userTimezone : course.timezone
              
              return (
                <TableRow 
                  key={course.documentId}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedCourse?.documentId === course.documentId ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => onCourseSelect?.(course)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      {course.teacher ? (
                        <>
                          <p className="font-medium">{course.teacher.name} {course.teacher.family}</p>
                          <p className="text-sm text-gray-600">@{course.teacher.username}</p>
                        </>
                      ) : (
                        <p className="text-gray-400">Не назначен</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getDirectionLabel(course.direction)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatWeekdays(course.weekdays)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="h-4 w-4" />
                      <div>
                        <p>{schedule.timeRange}</p>
                        <p className="text-gray-600">{displayTimezone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {course.isOnline ? (
                        <Badge variant="outline">Онлайн</Badge>
                      ) : (
                        <div className="flex items-start space-x-1 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p>{course.city}</p>
                            <p className="text-gray-600">{course.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CourseEnrollmentProgress
                      currentStudents={course.invoices?.length || 0}
                      minStudents={course.minStudents}
                      maxStudents={course.maxStudents}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{course.pricePerLesson} {course.currency}</p>
                      <p className="text-gray-600">за урок</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleActions(course.documentId)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      
      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-gray-700">
            Показано {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCourses)} из {totalCourses} курсов
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {generatePageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === -1 ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}