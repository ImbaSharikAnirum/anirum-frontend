/**
 * Виджет для отображения деталей курса
 * @layer widgets
 */

'use client'

import { Card } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  MapPin,
  Users,
  Languages,
  Palette,
  AlertCircle,
} from "lucide-react";
import { Course } from "@/entities/course/model/types";
import {
  formatWeekdays,
  getDirectionDisplayName,
  getComplexityDisplayName,
} from "@/shared/lib/course-utils";
import { Separator } from "@/components/ui/separator";
import { useUserTimezone } from '@/shared/hooks/useUserTimezone';
import { formatCourseSchedule } from '@/shared/lib/timezone-utils';

interface CourseDetailsProps {
  course: Course;
}

export function CourseDetails({ course }: CourseDetailsProps) {
  const { timezone: userTimezone, loading: timezoneLoading } = useUserTimezone()

  const formatSchedule = () => {
    if (timezoneLoading) {
      return {
        timeRange: `${course.startTime} - ${course.endTime}`,
        timezone: course.timezone,
        isConverted: false
      }
    }

    return formatCourseSchedule(
      course.startTime,
      course.endTime,
      course.timezone,
      userTimezone
    )
  }

  const getAgeRangeText = () => {
    const startAge = course.startAge;
    const endAge = course.endAge;

    if (!startAge && !endAge) {
      return "Без ограничений по возрасту";
    }

    // Если startAge >= 18, всегда показываем "от X лет"
    if (startAge && startAge >= 18) {
      return `от ${startAge} лет`;
    }

    if (startAge && endAge) {
      return `${startAge}-${endAge} лет`;
    }

    if (startAge && !endAge) {
      return `от ${startAge} лет`;
    }

    if (!startAge && endAge) {
      return `до ${endAge} лет`;
    }

    return "Без ограничений по возрасту";
  };

  return (
    <div className="space-y-3">
      {/* Название курса */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {getDirectionDisplayName(course.direction)}
        </h1>
        {course.description && (
          <p className="text-gray-600 mt-2 leading-relaxed">
            {course.description}
          </p>
        )}
      </div>
      <Separator />
      {/* Расписание и возраст */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Расписание и Возраст</h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              Возраст: {getAgeRangeText()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>
              Время: {(() => {
                const schedule = formatSchedule()
                const displayTimezone = schedule.isConverted ? userTimezone : course.timezone
                return `${schedule.timeRange} (${displayTimezone})`
              })()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>Дни недели: {formatWeekdays(course.weekdays)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-gray-500" />
            <span>Язык: {course.language}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>
              Длительность: до{" "}
              {course.endDate
                ? new Date(course.endDate).toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })
                : "май 2025"}
            </span>
          </div>
        </div>
      </div>
      <Separator />
      {/* Обучение */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Обучение</h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-500" />
            <span>
              Сложность: {getComplexityDisplayName(course.complexity)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>
              {course.inventoryRequired
                ? "Нужен свой инвентарь"
                : "Весь инвентарь предоставляется"}
            </span>
          </div>

          {course.inventoryRequired && course.inventoryDescription && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span>Инвентарь: {course.inventoryDescription}</span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
