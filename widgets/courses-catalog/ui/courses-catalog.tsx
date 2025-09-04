"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/shared/ui/course-card";
import { courseAPI } from "@/entities/course/api/courseApi";
import { Course } from "@/entities/course/model/types";

export function CoursesCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCourses() {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await courseAPI.getCourses({
          page: 1,
          pageSize: 25,
          sort: ['createdAt:desc'],
          populate: ['images', 'teacher']
        });

        if (!isCancelled) {
          setCourses(result.courses);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      isCancelled = true;
    };
  }, []);

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
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onClick={handleCourseClick}
          />
        ))}
      </div>
    </div>
  );
}
