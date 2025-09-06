/**
 * Виджет информации о преподавателе курса
 * @layer widgets
 */

import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'
import { Course } from '@/entities/course/model/types'

interface CourseTeacherInfoProps {
  course: Course
}

export function CourseTeacherInfo({ course }: CourseTeacherInfoProps) {
  return (
    <div className="">
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Информация о преподавателе</h3>
        
        <Card className="flex items-center justify-center p-4 w-fit">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage
                src={course.teacher?.avatar ? (typeof course.teacher.avatar === 'string' ? course.teacher.avatar : course.teacher.avatar?.url) : undefined}
                alt="Преподаватель"
                className="object-cover"
              />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <p className="font-medium text-gray-900">
              {course.teacher?.name}  {course.teacher?.family}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}