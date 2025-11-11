"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/shared/ui/course-card";
import { courseAPI } from "@/entities/course";
import { Course } from "@/entities/course/model/types";
import { CourseFilters, buildApiFilters, filterCourses } from "@/entities/course/lib/filters";
import { useUserTimezone } from "@/shared/hooks/useUserTimezone";
import { preloadImagesWithTimeout } from "@/shared/lib/image-preloader";

interface CoursesCatalogProps {
  filters?: CourseFilters;
  onCoursesCountChange?: (count: number) => void;
}

export function CoursesCatalog({ filters = {}, onCoursesCountChange }: CoursesCatalogProps) {
  const { timezone } = useUserTimezone();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCourses() {
      try {
        setIsLoading(true);
        setImagesLoaded(false);
        setCourses([]);
        setError(null);
        
        const apiFilters = buildApiFilters(filters, timezone);
        
        // Параметры для фильтрации инвойсов текущего месяца
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // getMonth() возвращает 0-11, нужно 1-12
        
        const result = await courseAPI.getCourses({
          page: 1,
          pageSize: 25,
          sort: ['createdAt:desc'],
          populate: ['images', 'teacher.avatar', 'invoices'],
          filters: apiFilters,
          withCount: true,
          invoicesMonth: currentMonth,
          invoicesYear: currentYear
        });

        if (!isCancelled) {
          // Применяем клиентскую фильтрацию для сложных фильтров (например, возраст)
          const filteredCourses = filterCourses(result.courses, filters);

          // Устанавливаем общий count (до клиентской фильтрации)
          const totalCount = result.meta?.pagination?.total || result.courses.length;
          setCoursesCount(totalCount);
          // Уведомляем родительский компонент
          onCoursesCountChange?.(totalCount);

          // Собираем первые изображения из ВСЕХ курсов для предзагрузки
          const imagesToPreload = filteredCourses.map(course => {
            if (course.images && course.images.length > 0) {
              const firstImage = course.images[0];
              return typeof firstImage === 'string' ? firstImage : firstImage.url;
            }
            return null;
          }).filter(Boolean) as string[];

          // Предзагружаем все изображения с таймаутом 10 секунд (увеличен из-за количества)
          preloadImagesWithTimeout(imagesToPreload, 10000).then(() => {
            if (!isCancelled) {
              setImagesLoaded(true);
              setCourses(filteredCourses);
            }
          });
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
          setIsLoading(false);
        }
      } finally {
        // Не устанавливаем isLoading в false здесь,
        // это произойдет после загрузки изображений
      }
    }

    loadCourses();

    return () => {
      isCancelled = true;
    };
  }, [filters, timezone]);

  // Отдельный эффект для отслеживания загрузки изображений
  useEffect(() => {
    if (imagesLoaded && courses.length > 0) {
      setIsLoading(false);
    }
  }, [imagesLoaded, courses]);

  const handleCourseClick = (course: any) => {
    // Переход на страницу курса
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 mt-6">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Ошибка загрузки курсов</p>
          <p className="text-gray-600">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="space-y-6 mt-6">
        <div className="text-center p-8">
          <p className="text-gray-600">Курсы не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {courses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={handleCourseClick}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
