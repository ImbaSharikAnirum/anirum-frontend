"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRole } from "@/shared/lib/hooks/useRole"
import { DashboardCoursesTable } from "@/widgets/dashboard-courses-table"
import { DashboardCoursesFilters, type DashboardCoursesFilterValues } from "@/widgets/dashboard-courses-filters"
import { DashboardCourseStudentsTable } from "@/widgets/dashboard-course-students-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home } from "lucide-react"
import type { Course } from "@/entities/course"

export default function TeacherMyCoursesPage() {
  const { isTeacher, user } = useRole()
  const router = useRouter()
  
  const [filters, setFilters] = useState<DashboardCoursesFilterValues>({
    teacher: null, // Не используется для Teacher, но нужно для совместимости
    format: undefined,
    month: undefined,
    year: undefined
  })
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFiltersChange = (newFilters: DashboardCoursesFilterValues) => {
    setFilters(newFilters)
    // Сбрасываем выбранный курс при изменении фильтров
    setSelectedCourse(null)
  }

  const handleStudentDeleted = () => {
    // Обновляем оба компонента
    setRefreshKey(prev => prev + 1)
  }

  // Проверка доступа только для преподавателей
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

  if (!isTeacher) {
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
              Эта страница доступна только преподавателям.
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
      <h1 className="text-4xl font-bold mb-8">Мои курсы</h1>
      
      <DashboardCoursesFilters 
        onFiltersChange={handleFiltersChange}
        className="mb-6"
        role="Teacher"
      />
      
      <DashboardCoursesTable 
        filters={filters}
        onCourseSelect={setSelectedCourse}
        selectedCourse={selectedCourse}
        refreshKey={refreshKey}
        role="Teacher"
        teacherDocumentId={user.documentId}
      />
      
      <DashboardCourseStudentsTable 
        course={selectedCourse}
        month={filters.month}
        year={filters.year}
        className="mt-6"
        onStudentDeleted={handleStudentDeleted}
        role="Teacher"
      />
    </div>
  )
}