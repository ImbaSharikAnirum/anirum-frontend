/**
 * Виджет формы бронирования курса
 * @layer widgets
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Course } from "@/entities/course/model/types";
import {
  calculateNextMonthPricing,
  getAllMonthlyPricing,
  formatPrice,
} from "@/shared/lib/course-pricing";

interface CourseBookingFormProps {
  course: Course;
}

export function CourseBookingForm({ course }: CourseBookingFormProps) {
  const router = useRouter();
  
  // Получаем все доступные месяцы для курса на основе startDate и endDate
  const availableMonths = getAllMonthlyPricing(course);
  
  // По умолчанию выбираем первый доступный месяц
  const [selectedMonthKey, setSelectedMonthKey] = useState(
    availableMonths.length > 0 ? `${availableMonths[0].year}-${availableMonths[0].month}` : ""
  );

  // Создаем массив опций для селекта с месяцем и годом
  const monthOptions = availableMonths.map(monthPricing => ({
    value: `${monthPricing.year}-${monthPricing.month}`,
    label: `${monthPricing.monthName} ${monthPricing.year}`,
    pricing: monthPricing
  }));

  // Находим выбранный месяц
  const selectedMonthPricing = availableMonths.find(
    m => `${m.year}-${m.month}` === selectedMonthKey
  );

  const handleBooking = () => {
    if (!selectedMonthPricing) return;
    
    // Создаем URL с параметрами для страницы бронирования
    // Преобразуем 0-based месяц в 1-based для URL
    const bookingUrl = `/courses/${course.documentId}/booking?month=${selectedMonthPricing.month + 1}&year=${selectedMonthPricing.year}`;
    router.push(bookingUrl);
  };

  return (
    <Card className="p-6 ">
      {/* Цена за занятие */}
      <div className="">
        <div className="text-lg font-semibold">
          {formatPrice(course.pricePerLesson, course.currency)}{" "}
          <span className=" font-normal">занятие</span>
        </div>
      </div>

      {/* Селект месяца */}
      <div>
        <Select value={selectedMonthKey} onValueChange={setSelectedMonthKey}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите месяц" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Детали выбранного месяца */}
      {selectedMonthPricing && selectedMonthPricing.isAvailable && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>В выбранном месяце занятий:</span>
            <span className="font-medium">{selectedMonthPricing.lessonsCount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>
              {formatPrice(course.pricePerLesson, course.currency)} x{" "}
              {selectedMonthPricing.lessonsCount} занятий
            </span>
            <span className="font-medium">
              {formatPrice(selectedMonthPricing.totalPrice, course.currency)}
            </span>
          </div>

          <hr className="my-2" />

          <div className="flex justify-between font-medium">
            <span>Всего</span>
            <span>
              {formatPrice(selectedMonthPricing.totalPrice, course.currency)}
            </span>
          </div>
        </div>
      )}

      {/* Кнопка бронирования */}
      <Button 
        className="w-full bg-red-600 hover:bg-red-700 text-white"
        onClick={handleBooking}
        disabled={!selectedMonthPricing || !selectedMonthPricing.isAvailable}
      >
        Забронировать
      </Button>

      <div className="text-xs text-gray-500 text-center">
        Пока вы ни за что не платите
      </div>
    </Card>
  );
}
