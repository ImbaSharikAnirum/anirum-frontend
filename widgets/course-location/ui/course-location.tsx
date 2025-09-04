/**
 * Виджет для отображения информации о местоположении курса
 * @layer widgets
 */

import { MapPin, Monitor } from "lucide-react";
import { Course } from "@/entities/course/model/types";
import { Separator } from "@/components/ui/separator";

interface CourseLocationProps {
  course?: Course;
}

export function CourseLocation({ course }: CourseLocationProps) {
  if (!course) {
    return null;
  }

  return (
    <div className="space-y-1 mb-4">
      <h3 className="font-medium text-gray-900">Где пройдут занятия</h3>

      <div className="flex items-center gap-2 text-md text-gray-700">
        {course.isOnline ? (
            <span>Онлайн</span>
        ) : (
          <span>{course.address}</span>
        )}
      </div>
    </div>
  );
}
