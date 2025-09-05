"use client";

import { Separator } from "@/components/ui/separator";
import { Course } from "@/entities/course/model/types";
import {
  calculateCustomMonthPricing,
  getMonthName,
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
  // Находим ближайший день начала в выбранном месяце на основе дней недели
  const getNextClassDate = () => {
    const weekdayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const targetWeekdays = course.weekdays
      .map((day) => weekdayMap[day.toLowerCase()])
      .filter((day) => day !== undefined);
    const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
    const monthEnd = new Date(selectedYear, selectedMonth, 0);

    for (
      let date = new Date(monthStart);
      date <= monthEnd;
      date.setDate(date.getDate() + 1)
    ) {
      if (targetWeekdays.includes(date.getDay())) {
        return date;
      }
    }

    return monthStart;
  };

  const nextClassDate = getNextClassDate();

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
            Старт обучения:{" "}
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
