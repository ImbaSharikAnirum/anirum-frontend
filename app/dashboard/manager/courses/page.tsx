"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRole } from "@/shared/lib/hooks/useRole"
import { ManagerCoursesTable } from "@/widgets/manager-courses-table"
import { ManagerCoursesFilters, type ManagerCoursesFilterValues } from "@/widgets/manager-courses-filters"
import { CourseStudentsTable } from "@/widgets/course-students-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Home } from "lucide-react"
import type { Course } from "@/entities/course"

export default function ManagerCoursesPage() {
  const { isManager, user } = useRole()
  const router = useRouter()
  
  const [filters, setFilters] = useState<ManagerCoursesFilterValues>({
    teacher: null,
    format: undefined,
    month: undefined,
    year: undefined
  })
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFiltersChange = (newFilters: ManagerCoursesFilterValues) => {
    setFilters(newFilters)
    // Сбрасываем выбранный курс при изменении фильтров
    setSelectedCourse(null)
  }

  const handleStudentDeleted = () => {
    // Обновляем оба компонента
    setRefreshKey(prev => prev + 1)
  }

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
      <h1 className="text-4xl font-bold mb-8">Курсы на проверку</h1>
      
      <ManagerCoursesFilters 
        onFiltersChange={handleFiltersChange}
        className="mb-6"
      />
      
      <ManagerCoursesTable 
        filters={filters}
        onCourseSelect={setSelectedCourse}
        selectedCourse={selectedCourse}
        refreshKey={refreshKey}
      />
      
      <CourseStudentsTable 
        course={selectedCourse}
        month={filters.month}
        year={filters.year}
        className="mt-6"
        onStudentDeleted={handleStudentDeleted}
      />
    </div>
  )
}