"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { Course } from "@/entities/course/model/types";
import { Invoice } from "@/entities/invoice";
import { CourseEnrollmentProgress } from "@/shared/ui/course-enrollment-progress";
import {
  calculateCustomMonthPricing,
  calculateProRatedPricing,
  formatPrice,
  getAllLessonDatesInPeriod,
} from "@/shared/lib/course-pricing";
import {
  formatWeekdays,
  getDirectionDisplayName,
  getStrapiImageUrl,
} from "@/shared/lib/course-utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { formatCourseSchedule } from "@/shared/lib/timezone-utils";
import { useUserTimezone } from "@/shared/hooks/useUserTimezone";

interface BookingCardProps {
  course: Course;
  selectedMonth: number;
  selectedYear: number;
  monthlyInvoices?: Invoice[];
  paymentInvoice?: Invoice; // Опциональный invoice для payment страницы
}

export function BookingCard({
  course,
  selectedMonth,
  selectedYear,
  monthlyInvoices = [],
  paymentInvoice,
}: BookingCardProps) {
  const { timezone: userTimezone, loading: timezoneLoading } =
    useUserTimezone();

  // Рассчитываем полные данные для выбранного месяца
  const monthlyPricing = calculateCustomMonthPricing({
    year: selectedYear,
    month: selectedMonth - 1, // Преобразуем в 0-based index
    pricePerLesson: course.pricePerLesson,
    currency: course.currency,
    weekdays: course.weekdays,
    courseStartDate: course.startDate,
    courseEndDate: course.endDate,
  });

  // Рассчитываем оставшиеся занятия с сегодняшней даты
  const proRatedPricing = calculateProRatedPricing({
    fromDate: new Date(), // С сегодняшнего дня
    year: selectedYear,
    month: selectedMonth - 1,
    pricePerLesson: course.pricePerLesson,
    currency: course.currency,
    weekdays: course.weekdays,
    courseStartDate: course.startDate,
    courseEndDate: course.endDate,
  });

  // Используем pro-rated если есть пропущенные занятия, иначе полную цену
  let displayPricing = proRatedPricing.isPartial
    ? proRatedPricing
    : {
        ...monthlyPricing,
        completedLessons: 0,
        remainingLessons: monthlyPricing.lessonsCount,
        isPartial: false,
        proRatedPrice: monthlyPricing.totalPrice, // Добавляем недостающее свойство
        fullPrice: monthlyPricing.totalPrice,
        fromDate: new Date(),
      };

  // Если есть paymentInvoice, используем данные из него
  let actualPricePerLesson = course.pricePerLesson;
  let hasDiscount = false;

  if (paymentInvoice) {
    // Рассчитываем количество занятий из дат invoice (правильный способ)
    const invoiceStartDate = new Date(paymentInvoice.startDate);
    const invoiceEndDate = new Date(paymentInvoice.endDate);
    const courseStartDate = new Date(course.startDate);
    const courseEndDate = new Date(course.endDate);
    
    const invoiceLessonDates = getAllLessonDatesInPeriod(
      invoiceStartDate,
      invoiceEndDate,
      course.weekdays,
      courseStartDate,
      courseEndDate
    );
    
    const invoiceLessonsCount = invoiceLessonDates.length;
    
    // Вычисляем реальную цену за занятие из invoice
    const invoicePricePerLesson = invoiceLessonsCount > 0 
      ? paymentInvoice.sum / invoiceLessonsCount
      : course.pricePerLesson;
    
    // Проверяем, есть ли скидка (разница больше или равна 0.01)
    if (Math.abs(invoicePricePerLesson - course.pricePerLesson) >= 0.01) {
      actualPricePerLesson = invoicePricePerLesson;
      hasDiscount = true;
      
      // Пересчитываем displayPricing с новой ценой
      displayPricing = {
        ...displayPricing,
        proRatedPrice: paymentInvoice.sum, // Используем сумму из invoice
      };
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMMM", { locale: ru });
    } catch {
      return dateStr;
    }
  };

  const formatSchedule = () => {
    if (timezoneLoading) {
      return {
        timeRange: `${course.startTime} - ${course.endTime}`,
        timezone: course.timezone,
        isConverted: false,
      };
    }

    return formatCourseSchedule(
      course.startTime,
      course.endTime,
      course.timezone,
      userTimezone
    );
  };

  const getAgeRangeText = () => {
    const startAge = course.startAge;
    const endAge = course.endAge;

    if (!startAge && !endAge) {
      return null;
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

    return null;
  };

  const schedule = formatSchedule();
  const displayTimezone = schedule.isConverted ? userTimezone : course.timezone;
  const formattedWeekdays = formatWeekdays(course.weekdays);
  const ageRangeText = getAgeRangeText();

  return (
    <Card className="p-4 gap-2">
      {/* Верхняя часть - изображение и детали в ряд */}
      <div className="flex gap-4 mb-2">
        {/* Изображение курса - меньше размером */}
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
          {course.images && course.images.length > 0 ? (
            <Image
              src={
                typeof course.images[0] === "string"
                  ? course.images[0]
                  : getStrapiImageUrl(course.images[0].url)
              }
              alt={getDirectionDisplayName(course.direction)}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
              {getDirectionDisplayName(course.direction)
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* Детали курса справа */}
        <div className="flex-1 min-w-0">
          {/* Аватар преподавателя и информация */}
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={
                  course.teacher?.avatar
                    ? typeof course.teacher.avatar === "string"
                      ? course.teacher.avatar
                      : course.teacher.avatar?.url
                    : undefined
                }
                alt="Преподаватель"
                className="object-cover"
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                {getDirectionDisplayName(course.direction)}
              </div>
              <div className="text-sm text-gray-600">
                {course.isOnline
                  ? "Онлайн"
                  : `${course.city}, ${course.country}`}
              </div>
            </div>
          </div>

          {/* Информация о расписании */}
          <div className="space-y-1 text-sm text-gray-600">
            <div>{formattedWeekdays}</div>
            <div>
              {schedule.timeRange} ({displayTimezone})
            </div>
            {ageRangeText && <div>{ageRangeText}</div>}
          </div>
        </div>
      </div>

      {/* Прогресс записи на выбранный месяц */}
      <CourseEnrollmentProgress
        currentStudents={monthlyInvoices.length}
        minStudents={course.minStudents}
        maxStudents={course.maxStudents}
        className=""
      />
      <Separator className="" />

      {/* Детализация цены - только если нет готового invoice */}
      {!paymentInvoice ? (
        <div className="space-y-3">
          <h4 className="font-medium">Детализация цены</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Цена занятия</span>
              <div className="text-right">
                {hasDiscount && (
                  <div className="line-through text-gray-500 text-xs">
                    {formatPrice(course.pricePerLesson, course.currency)}
                  </div>
                )}
                <span className={hasDiscount ? "text-green-600 font-medium" : ""}>
                  {formatPrice(actualPricePerLesson, course.currency)}
                </span>
                {hasDiscount && (
                  <div className="text-xs text-green-600">Персональная скидка</div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <span>Занятий в {displayPricing.monthName.toLowerCase()}</span>
              <span>{displayPricing.remainingLessons}</span>
            </div>

            <div className="flex justify-between">
              <span>
                {formatPrice(actualPricePerLesson, course.currency)} ×{" "}
                {displayPricing.remainingLessons} занятий
              </span>
              <span>
                {formatPrice(displayPricing.proRatedPrice, course.currency)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Всего</span>
            <span>
              {formatPrice(displayPricing.proRatedPrice, course.currency)}
            </span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
