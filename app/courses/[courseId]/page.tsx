"use client";

import { useState, useEffect } from "react";
import { CourseImages } from "@/widgets/course-images";
import { CourseDetails } from "@/widgets/course-details";
import { CourseMaps } from "@/widgets/course-maps";
import { CourseLocation } from "@/widgets/course-location";
import { CourseBookingForm } from "@/widgets/course-booking-form";
import { CourseTeacherInfo } from "@/widgets/course-teacher-info";
import { courseAPI } from "@/entities/course/api/courseApi";
import { Course } from "@/entities/course/model/types";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { CourseRules } from "@/widgets/course-rules/ui/course-rules";

export default function CoursePage() {
  const params = useParams();
  const courseId = params?.courseId as string; // Теперь это documentId (строка)

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCourse() {
      try {
        const result = await courseAPI.getCourse(courseId, [
          "images",
          "teacher.avatar",
        ]);
        setCourse(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-64 mb-8"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Ошибка загрузки курса</p>
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

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <p className="text-gray-600">Курс не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseImages images={course.images} courseName={course.direction} />

      <div className="flex flex-col lg:flex-row gap-8 mt-8 mb-8">
        {/* Левая колонка - детали курса */}
        <div className="flex-1 space-y-6">
          <CourseDetails course={course} />
          <Separator />
          <CourseTeacherInfo course={course} />
        </div>

        {/* Правая колонка - форма бронирования */}
        <div className="w-full lg:w-80">
          <div className="sticky top-4">
            <CourseBookingForm course={course} />
          </div>
        </div>
      </div>
      <CourseLocation course={course} />
      <CourseMaps course={course} />
      <Separator />
      <CourseRules />
    </div>
  );
}
