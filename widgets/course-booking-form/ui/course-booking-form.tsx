/**
 * Виджет формы бронирования курса
 * @layer widgets
 */

import { useState, useEffect } from "react";
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
import { invoiceAPI, Invoice } from "@/entities/invoice";
import { CourseEnrollmentProgress } from "@/shared/ui/course-enrollment-progress";
import {
  getAllMonthlyPricing,
  formatPrice,
} from "@/shared/lib/course-pricing";

interface CourseBookingFormProps {
  course: Course;
}

export function CourseBookingForm({ course }: CourseBookingFormProps) {
  const router = useRouter();

  // Получаем все доступные месяцы с оставшимися занятиями
  const availableMonths = getAllMonthlyPricing(course);

  // Выбираем первый доступный месяц (уже содержит только месяцы с remainingLessons > 0)
  const [selectedMonthKey, setSelectedMonthKey] = useState(
    availableMonths.length > 0
      ? `${availableMonths[0].year}-${availableMonths[0].month}`
      : ""
  );

  // Состояние для инвойсов выбранного месяца
  const [monthlyInvoices, setMonthlyInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  // Загрузка инвойсов при смене выбранного месяца
  useEffect(() => {
    if (!selectedMonthKey) return;

    const loadInvoices = async () => {
      try {
        setIsLoadingInvoices(true);
        const [year, month] = selectedMonthKey.split("-");

        const invoices = await invoiceAPI.getCourseInvoices(course.documentId, {
          month: parseInt(month) + 1, // Конвертируем 0-based в 1-based
          year: parseInt(year),
        });

        setMonthlyInvoices(invoices);
      } catch (error) {
        console.error("Ошибка загрузки инвойсов:", error);
        setMonthlyInvoices([]);
      } finally {
        setIsLoadingInvoices(false);
      }
    };

    loadInvoices();
  }, [selectedMonthKey, course.documentId]);

  // Создаем массив опций для селекта с месяцем и годом
  const monthOptions = availableMonths.map((monthPricing) => ({
    value: `${monthPricing.year}-${monthPricing.month}`,
    label: `${monthPricing.monthName} ${monthPricing.year}`,
    pricing: monthPricing,
  }));

  // Находим выбранный месяц
  const selectedMonthPricing = availableMonths.find(
    (m) => `${m.year}-${m.month}` === selectedMonthKey
  );

  // Используем данные из selectedMonthPricing (уже содержат правильное количество оставшихся занятий)
  const displayPricing = selectedMonthPricing
    ? {
        remainingLessons: selectedMonthPricing.lessonsCount, // Уже содержит только оставшиеся
        proRatedPrice: selectedMonthPricing.totalPrice,
        fullPrice: selectedMonthPricing.totalPrice,
        isPartial: false,
        fromDate: new Date(),
      }
    : null;

  const handleBooking = () => {
    if (!selectedMonthPricing) return;

    // Создаем URL с параметрами для страницы бронирования
    // Преобразуем 0-based месяц в 1-based для URL
    const bookingUrl = `/courses/${course.documentId}/booking?month=${
      selectedMonthPricing.month + 1
    }&year=${selectedMonthPricing.year}`;
    router.push(bookingUrl);
  };

  return (
    <Card className="p-6 gap-4">
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
      {displayPricing && selectedMonthPricing?.isAvailable && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>В выбранном месяце занятий:</span>
            <span className="font-medium">
              {displayPricing.remainingLessons}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span>
              {formatPrice(course.pricePerLesson, course.currency)} x{" "}
              {displayPricing.remainingLessons} занятий
            </span>
            <span className="font-medium">
              {formatPrice(displayPricing.proRatedPrice, course.currency)}
            </span>
          </div>

          <hr className="my-2" />

          <div className="flex justify-between font-medium">
            <span>Всего</span>
            <span>
              {formatPrice(displayPricing.proRatedPrice, course.currency)}
            </span>
          </div>
        </div>
      )}

      {/* Кнопка бронирования */}
      <Button
        className="w-full "
        onClick={handleBooking}
        disabled={!selectedMonthPricing || !selectedMonthPricing.isAvailable}
      >
        Забронировать
      </Button>

      {/* Прогресс записи на выбранный месяц */}
      {isLoadingInvoices ? (
        <div className="py-2">
          <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <CourseEnrollmentProgress
          currentStudents={monthlyInvoices.length}
          minStudents={course.minStudents}
          maxStudents={course.maxStudents}
        />
      )}
    </Card>
  );
}
