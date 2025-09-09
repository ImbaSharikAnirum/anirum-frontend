import { DirectionFilter, FormatFilter, AgeFilter, TeacherFilter, AdvancedFilter, type LocationData } from '@/features/courses-filters'
import { MobileCoursesFilters } from './mobile-courses-filters'
import { CourseFilters } from '@/entities/course/lib/filters'

interface CoursesFiltersProps {
  directionValue?: string;
  formatValue?: 'online' | 'offline';
  cityValue?: string;
  ageValue?: number;
  teacherValue?: string | null;
  coursesCount?: number;
  onDirectionChange?: (direction: string | undefined) => void;
  onFormatAndLocationChange?: (format: 'online' | 'offline' | undefined, locationData?: LocationData) => void;
  onAgeChange?: (age: number | undefined) => void;
  onTeacherChange?: (teacherId: string | null) => void;
  onApplyAdvancedFilters?: (filters: { days: string[], price: number[], timeSlot: string }) => void;
  onCountCourses?: (baseFilters: CourseFilters, advancedFilters: { days: string[], price: number[], timeSlot: string }) => Promise<number>;
  baseFilters?: CourseFilters;
}

export function CoursesFilters({ 
  directionValue, 
  formatValue, 
  cityValue,
  ageValue,
  teacherValue,
  coursesCount,
  onDirectionChange, 
  onFormatAndLocationChange,
  onAgeChange,
  onTeacherChange,
  onApplyAdvancedFilters,
  onCountCourses,
  baseFilters
}: CoursesFiltersProps) {
  return (
    <div className="space-y-4 w-full md:w-auto">
      {/* Мобильная версия */}
      <MobileCoursesFilters 
        filters={{ 
          direction: directionValue, 
          format: formatValue, 
          city: cityValue, 
          age: ageValue, 
          teacherId: teacherValue 
        }}
        coursesCount={coursesCount}
        setDirection={onDirectionChange || (() => {})}
        setFormatAndLocation={onFormatAndLocationChange || (() => {})}
        setAge={onAgeChange || (() => {})}
        setTeacher={(teacherId) => onTeacherChange?.(teacherId)}
        clearFilters={() => {
          onDirectionChange?.(undefined)
          onFormatAndLocationChange?.(undefined, undefined)
          onAgeChange?.(undefined)
          onTeacherChange?.(null)
        }}
      />
      
      {/* Десктопная версия */}
      <div className="hidden md:flex gap-4 flex-wrap [&_button]:h-12 [&_button]:px-4">
        <DirectionFilter 
          value={directionValue}
          onDirectionChange={onDirectionChange}
        />
        <FormatFilter 
          value={formatValue}
          cityValue={cityValue}
          onFormatAndLocationChange={onFormatAndLocationChange}
        />
        <AgeFilter 
          value={ageValue}
          onAgeChange={onAgeChange}
        />
        <TeacherFilter 
          value={teacherValue}
          onTeacherChange={onTeacherChange}
        />
        <AdvancedFilter 
          baseFilters={baseFilters || { 
            direction: directionValue, 
            format: formatValue, 
            city: cityValue, 
            age: ageValue, 
            teacherId: teacherValue || undefined 
          }}
          baseCourseCount={coursesCount}
          onCountCourses={onCountCourses}
          onApplyAdvancedFilters={onApplyAdvancedFilters}
        />
      </div>
    </div>
  )
}
