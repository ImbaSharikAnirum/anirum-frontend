"use client";

import { Separator } from "@/components/ui/separator";
import { Course } from "@/entities/course/model/types";
import {
  calculateCustomMonthPricing,
  getMonthName,
  getMonthLessonDates,
  getAllLessonDatesInMonth,
} from "@/shared/lib/course-pricing";

interface BookingDetailsProps {
  course: Course;
  selectedMonth: number;
  selectedYear: number;
}

export function BookingDetails({
  course,
  selectedMonth,
  selectedYear,
}: BookingDetailsProps) {
  // Получаем все даты занятий в выбранном месяце
  const allLessonDates = getAllLessonDatesInMonth(
    selectedYear,
    selectedMonth - 1, // Конвертируем в 0-based как ожидает функция
    course.weekdays,
    new Date(course.startDate),
    new Date(course.endDate)
  );

  // Находим ближайшее будущее занятие (которое еще не прошло)
  const currentDate = new Date();
  const nextClassDate = allLessonDates.find(date => date >= currentDate) 
    || allLessonDates[0] // Если все занятия прошли, берем первое в месяце
    || new Date(selectedYear, selectedMonth - 1, 1); // Fallback


  // Рассчитываем длительность от выбранного месяца до окончания курса
  const startMonth = `${getMonthName(selectedMonth - 1)} ${selectedYear}`;
  const endDate = new Date(course.endDate);
  const endMonth = `${getMonthName(
    endDate.getMonth()
  )} ${endDate.getFullYear()}`;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ваши занятия</h2>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="font-medium">Формат</div>
          <div className="text-md text-gray-600">Оплачивать ежемесячно</div>
        </div>

        <div className="space-y-1">
          <div className="font-medium">Даты:</div>
          <div className="text-md text-gray-600">
            Ближайшее занятие:{" "}
            {nextClassDate.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
            })}
          </div>
          <div className="text-md text-gray-600">
            {startMonth} - {endMonth}
          </div>
        </div>
      </div>
      
      <Separator />
    </div>
  );
}
