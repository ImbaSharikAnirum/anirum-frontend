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
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle } from "lucide-react"

interface ManagerCoursesTableProps {
  className?: string
}

export function ManagerCoursesTable({ className }: ManagerCoursesTableProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCourses() {
      try {
        setIsLoading(true)
        setError(null)
        
        // Получаем курсы со статусом pending_approval для проверки менеджером
        const response = await courseAPI.getCourses({
          filters: {
            status: { $eq: 'pending_approval' }
          },
          populate: ["images", "teacher.avatar"],
          sort: ["createdAt:desc"]
        })
        
        setCourses(response.courses)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка при загрузке курсов")
      } finally {
        setIsLoading(false)
      }
    }

    loadCourses()
  }, [])

  const handleApprove = async (courseId: string) => {
    // TODO: Реализовать логику одобрения курса
    console.log("Одобрить курс:", courseId)
  }

  const handleReject = async (courseId: string) => {
    // TODO: Реализовать логику отклонения курса
    console.log("Отклонить курс:", courseId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5) // Показывать только HH:MM
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
      'club': 'Клуб',
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
              <TableHead>Курс</TableHead>
              <TableHead>Преподаватель</TableHead>
              <TableHead>Направление</TableHead>
              <TableHead>Даты</TableHead>
              <TableHead>Время</TableHead>
              <TableHead>Местоположение</TableHead>
              <TableHead>Участники</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Сложность</TableHead>
              <TableHead>Тип</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.documentId}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium line-clamp-2">{course.description}</p>
                    {course.software && (
                      <Badge variant="outline" className="text-xs">
                        {course.software}
                      </Badge>
                    )}
                  </div>
                </TableCell>
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
                  <div className="flex items-center space-x-1 text-sm">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p>{formatDate(course.startDate)}</p>
                      <p className="text-gray-600">до {formatDate(course.endDate)}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p>{formatTime(course.startTime)} - {formatTime(course.endTime)}</p>
                      <p className="text-gray-600">{course.timezone}</p>
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
                  <div className="flex items-center space-x-1 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{course.minStudents}-{course.maxStudents}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{course.pricePerLesson} {course.currency}</p>
                    <p className="text-gray-600">за урок</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getComplexityLabel(course.complexity)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getCourseTypeLabel(course.courseType)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{formatDate(course.createdAt)}</p>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(course.documentId)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(course.documentId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}