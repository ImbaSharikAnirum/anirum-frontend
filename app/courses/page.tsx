import { CoursesFilters } from '@/widgets/courses-filters'
import { CoursesCatalog } from '@/widgets/courses-catalog'

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-4 space-y-4">
      {/* Фильтры курсов - сверху */}
      <CoursesFilters />
      
      {/* Каталог курсов - снизу */}
      <CoursesCatalog />
    </div>
  )
}