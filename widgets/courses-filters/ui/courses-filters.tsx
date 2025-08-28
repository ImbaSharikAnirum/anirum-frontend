import { CoursesDirectionFilter } from '@/features/courses-direction-filter'
import { CoursesFormatFilter } from '@/features/courses-format-filter'
import { CoursesAgeFilter } from '@/features/courses-age-filter'
import { CoursesTeacherFilter } from '@/features/courses-teacher-filter'
import { CoursesAdvancedFilter } from '@/features/courses-advanced-filter'

export function CoursesFilters() {
  return (
    <div className="space-y-4">
      
      {/* Фильтры в одну строку */}
      <div className="flex gap-4 flex-wrap [&_button]:h-12 [&_button]:px-4">
        <CoursesDirectionFilter />
        <CoursesFormatFilter />
        <CoursesAgeFilter />
        <CoursesTeacherFilter />
        <CoursesAdvancedFilter />
      </div>
    </div>
  )
}