/**
 * Виджет информации о преподавателе курса
 * @layer widgets
 */

import { Card } from '@/components/ui/card'
import Image from 'next/image'
import { Course } from '@/entities/course/model/types'

interface CourseTeacherInfoProps {
  course: Course
}

export function CourseTeacherInfo({ course }: CourseTeacherInfoProps) {
  console.log(course);
  return (
    <div className="">
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Информация о преподавателе</h3>
        
        <Card className="flex items-center justify-center p-4 w-fit">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <Image
                src={course.teacher?.avatar ? (typeof course.teacher.avatar === 'string' ? course.teacher.avatar : course.teacher.avatar?.url || '/default-avatar.png') : '/default-avatar.png'}
                alt="Преподаватель"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <p className="font-medium text-gray-900">
              {course.teacher?.name}  {course.teacher?.family}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}