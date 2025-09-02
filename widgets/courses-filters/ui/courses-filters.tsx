import { DirectionFilter, FormatFilter, AgeFilter, TeacherFilter, AdvancedFilter } from '@/features/courses-filters'
import { MobileCoursesFilters } from './mobile-courses-filters'

export function CoursesFilters() {
  return (
    <div className="space-y-4">
      {/* Мобильная версия */}
      <MobileCoursesFilters />
      
      {/* Десктопная версия */}
      <div className="hidden md:flex gap-4 flex-wrap [&_button]:h-12 [&_button]:px-4">
        <DirectionFilter />
        <FormatFilter />
        <AgeFilter />
        <TeacherFilter />
        <AdvancedFilter />
      </div>
    </div>
  )
}
