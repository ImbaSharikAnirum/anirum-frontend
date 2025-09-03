
import { CourseForm } from '@/features/course-create'

export function CreateCoursePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Создать курс</h1>
      <CourseForm />
    </div>
  )
}