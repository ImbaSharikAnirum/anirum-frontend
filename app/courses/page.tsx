"use client";

import { useState, useCallback } from "react";
import { CoursesFilters } from "@/widgets/courses-filters";
import { CoursesCatalog } from "@/widgets/courses-catalog";
import { useCoursesFilters } from "@/features/courses-filters";
import { courseAPI } from "@/entities/course/api/courseApi";
import { CourseFilters, buildApiFilters } from "@/entities/course/lib/filters";

export default function CoursesPage() {
  const { filters, setDirection, setFormatAndLocation, setAge, setTeacher, setWeekdays, setPriceRange } = useCoursesFilters();
  const [coursesCount, setCoursesCount] = useState(0);

  // Функция подсчета курсов с расширенными фильтрами
  const handleCountCourses = useCallback(async (baseFilters: CourseFilters, advancedFilters: { days: string[], price: number[], timeSlot: string }) => {
    const combinedFilters: CourseFilters = {
      ...baseFilters,
      weekdays: advancedFilters.days.length > 0 ? advancedFilters.days : undefined,
      priceRange: !(advancedFilters.price[0] === 0 && advancedFilters.price[1] === 10000) 
        ? [advancedFilters.price[0], advancedFilters.price[1]] as [number, number]
        : undefined
    };

    const apiFilters = buildApiFilters(combinedFilters);
    
    const result = await courseAPI.getCourses({
      page: 1,
      pageSize: 1, // Минимальный запрос для получения count
      filters: apiFilters,
      withCount: true
    });

    return result.meta?.pagination?.total || 0;
  }, []);

  // Обработчик применения расширенных фильтров
  const handleApplyAdvancedFilters = useCallback((advancedFilters: { days: string[], price: number[], timeSlot: string }) => {
    // Применяем дни недели к основной системе фильтров
    setWeekdays(advancedFilters.days.length > 0 ? advancedFilters.days : undefined);
    
    // Применяем ценовой диапазон к основной системе фильтров
    const hasCustomPrice = !(advancedFilters.price[0] === 0 && advancedFilters.price[1] === 10000);
    setPriceRange(hasCustomPrice ? [advancedFilters.price[0], advancedFilters.price[1]] as [number, number] : undefined);
    
    // TODO: Добавить timeSlot когда будет готов в основной системе
  }, [setWeekdays, setPriceRange]);

  return (
    <div className="mx-auto px-4 py-4 space-y-4">
      {/* Фильтры курсов - сверху */}
      <div className="flex justify-center w-full md:w-auto">
        <CoursesFilters 
          directionValue={filters.direction}
          formatValue={filters.format}
          cityValue={filters.city}
          ageValue={filters.age}
          teacherValue={filters.teacherId}
          coursesCount={coursesCount}
          onDirectionChange={setDirection}
          onFormatAndLocationChange={setFormatAndLocation}
          onAgeChange={setAge}
          onTeacherChange={setTeacher}
          onApplyAdvancedFilters={handleApplyAdvancedFilters}
          onCountCourses={handleCountCourses}
          baseFilters={filters}
        />
      </div>

      {/* Каталог курсов - снизу */}
      <CoursesCatalog 
        filters={filters} 
        onCoursesCountChange={setCoursesCount}
      />
    </div>
  );
}
