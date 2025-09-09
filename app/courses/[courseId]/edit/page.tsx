"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CourseForm } from "@/features/course-create"
import { courseAPI } from "@/entities/course"
import type { Course } from "@/entities/course"
import { useRole } from "@/shared/hooks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Home } from "lucide-react"

interface EditCoursePageProps {
  params: Promise<{
    courseId: string
  }>
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  const [courseId, setCourseId] = useState<string>("")
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isManager, isTeacher, user } = useRole()
  const router = useRouter()

  useEffect(() => {
    const getCourseId = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.courseId)
    }
    getCourseId()
  }, [params])

  useEffect(() => {
    if (!courseId) return

    const loadCourse = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const courseData = await courseAPI.getCourse(courseId, ["images", "teacher.avatar"])
        setCourse(courseData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка при загрузке курса")
      } finally {
        setIsLoading(false)
      }
    }

    loadCourse()
  }, [courseId])

  const handleSuccess = (updatedCourse: Course) => {
    router.push(`/courses/${updatedCourse.documentId}`)
  }

  const handleBack = () => {
    router.back()
  }

  // Проверка доступа
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
              Для доступа к редактированию курса необходимо войти в систему.
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Загрузка курса...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Ошибка загрузки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {error || "Курс не найден"}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
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

  // Проверка прав доступа к редактированию
  const canEdit = isManager || (isTeacher && course.teacher?.documentId === user.documentId)

  if (!canEdit) {
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
              Вы можете редактировать только свои курсы.
            </p>
            <p className="text-sm text-gray-500">
              Ваша роль: {user.role?.name || 'Не определена'}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={handleBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-4xl font-bold">Редактирование курса</h1>
      </div>
      
      <CourseForm 
        mode="edit" 
        initialData={course} 
        onSuccess={handleSuccess}
      />
    </div>
  )
}