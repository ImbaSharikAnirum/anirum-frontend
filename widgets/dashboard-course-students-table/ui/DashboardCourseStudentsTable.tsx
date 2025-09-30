"use client";

import React, { useEffect, useState } from "react";
import {
  invoiceAPI,
  type Invoice,
  type AttendanceStatus,
  useAttendanceManager,
} from "@/entities/invoice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  XCircle,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Info,
  Copy,
  Users,
  MessageSquare,
  CalendarDays,
} from "lucide-react";
import {
  generateCourseDates,
  formatAttendanceDate,
} from "@/shared/lib/attendance-utils";
import { StudentActionsDropdown } from "@/shared/ui/student-actions-dropdown";
import { StudentAttendanceCell } from "./StudentAttendanceCell";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Course } from "@/entities/course";

type UserRole = "Manager" | "Teacher";

interface DashboardCourseStudentsTableProps {
  course: Course | null;
  month?: number;
  year?: number;
  className?: string;
  onStudentDeleted?: () => void;
  role?: UserRole;
}

export function DashboardCourseStudentsTable({
  course,
  month,
  year,
  className,
  onStudentDeleted,
  role = "Manager",
}: DashboardCourseStudentsTableProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkResults, setBulkResults] = useState<any>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [isCopyingToNextMonth, setIsCopyingToNextMonth] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);

  // Инициализируем attendance manager для всей таблицы
  const attendanceManager = useAttendanceManager({ invoices });

  const loadInvoices = async () => {
    if (!course) {
      setInvoices([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await invoiceAPI.getCourseInvoices(course.documentId, {
        month,
        year,
      });

      // Стабильная сортировка студентов по алфавиту (многоязычная)
      const sortedInvoices = response.sort((a, b) => {
        const fullNameA = `${a.family || ""} ${a.name || ""}`.trim();
        const fullNameB = `${b.family || ""} ${b.name || ""}`.trim();

        // Используем Intl.Collator для правильной многоязычной сортировки
        return new Intl.Collator(["ru", "en"], {
          sensitivity: "base",
          numeric: true,
          ignorePunctuation: true,
        }).compare(fullNameA, fullNameB);
      });

      setInvoices(sortedInvoices);

      // Отладочная информация для проверки populate
      console.log("📊 Invoices loaded:", {
        count: sortedInvoices.length,
        sample: sortedInvoices[0],
        ownersInfo: sortedInvoices.map((inv) => ({
          name: `${inv.name} ${inv.family}`,
          hasOwner: !!inv.owner,
          whatsappVerified: inv.owner?.whatsapp_phone_verified,
          telegramVerified: inv.owner?.telegram_phone_verified,
          telegramChatId: inv.owner?.telegram_chat_id,
        })),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка при загрузке студентов"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [course, month, year]);

  const handleStudentDeleted = () => {
    // Перезагружаем список студентов
    loadInvoices();
    // Уведомляем родительский компонент
    onStudentDeleted?.();
  };

  const handleCopyStudentsList = async () => {
    if (!course || invoices.length === 0) {
      toast.error("Нет студентов для копирования");
      return;
    }

    // Получаем информацию о преподавателе
    const teacherInfo = course.teacher
      ? `${course.teacher.name || ""} ${course.teacher.family || ""}`.trim()
      : "Не указан";

    // Формируем список с преподавателем первым
    const peopleList = [
      `1. ${teacherInfo} (преподаватель)`,
      ...invoices.map(
        (invoice, index) => `${index + 2}. ${invoice.name} ${invoice.family}`
      ),
    ].join("\n");

    const message = peopleList;

    try {
      await navigator.clipboard.writeText(message);
      toast.success("Список студентов скопирован");
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea");
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Список студентов скопирован");
    }
  };

  const handleBulkSendPaymentMessages = async () => {
    if (!course) {
      toast.error("Курс не выбран");
      return;
    }

    if (invoices.length === 0) {
      toast.error("Нет студентов для отправки сообщений");
      return;
    }

    // Подсчитываем студентов с верифицированными контактами
    const studentsWithContacts = invoices.filter(
      (invoice) =>
        invoice.owner &&
        ((invoice.owner.whatsapp_phone_verified &&
          invoice.owner.whatsapp_phone) ||
          (invoice.owner.telegram_phone_verified &&
            invoice.owner.telegram_chat_id))
    );

    if (studentsWithContacts.length === 0) {
      toast.error("У студентов нет верифицированных контактов в мессенджерах");
      return;
    }

    setIsBulkSending(true);
    setIsBulkDialogOpen(false);

    try {
      console.log(`📤 Отправляем запрос на массовую отправку:`, {
        courseId: course.documentId,
        month,
        year,
        monthType: typeof month,
        yearType: typeof year
      });

      const response = await invoiceAPI.bulkSendPaymentMessages({
        courseId: course.documentId,
        month,
        year,
      });

      if (response.success) {
        setBulkResults(response.results);
        setIsResultsDialogOpen(true);

        toast.success(
          `Отправка завершена: ${response.results.sent} из ${response.results.total} сообщений отправлено`,
          {
            description:
              response.results.failed > 0
                ? `${response.results.failed} сообщений не удалось отправить. Нажмите для просмотра деталей`
                : "Все сообщения отправлены успешно",
            action: {
              label: "Подробнее",
              onClick: () => setIsResultsDialogOpen(true),
            },
          }
        );
      } else {
        toast.error("Ошибка при массовой отправке сообщений");
      }
    } catch (error) {
      console.error("Ошибка массовой отправки:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при отправке сообщений"
      );
    } finally {
      setIsBulkSending(false);
    }
  };

  const handleCopyToNextMonth = async () => {
    if (!course) {
      toast.error("Курс не выбран");
      return;
    }

    if (invoices.length === 0) {
      toast.error("Нет счетов для копирования");
      return;
    }

    const currentDate = new Date();
    const currentYear = year || currentDate.getFullYear();
    const currentMonth = month || (currentDate.getMonth() + 1);

    setIsCopyingToNextMonth(true);
    setIsCopyDialogOpen(false);

    try {
      const response = await invoiceAPI.copyInvoicesToNextMonth({
        courseId: course.documentId,
        currentMonth,
        currentYear,
      });

      if (response.success) {
        toast.success(
          `Успешно скопировано: ${response.results.copiedCount} из ${response.results.originalCount} счетов на ${response.results.nextMonth}/${response.results.nextYear}`,
          {
            description: response.results.copiedCount < response.results.originalCount
              ? `${response.results.originalCount - response.results.copiedCount} счетов уже существовали`
              : `Сумма: ${response.results.monthlySum} ${response.results.currency} (${response.results.lessonsCount} занятий × ${response.results.pricePerLesson})`
          }
        );

        // Обновляем список если мы сейчас смотрим на следующий месяц
        const nextMonth = response.results.nextMonth;
        const nextYear = response.results.nextYear;
        if (month === nextMonth && year === nextYear) {
          loadInvoices();
        }
      } else {
        toast.error("Ошибка при копировании счетов");
      }
    } catch (error) {
      console.error("Ошибка копирования счетов:", error);
      toast.error(error instanceof Error ? error.message : "Ошибка при копировании счетов");
    } finally {
      setIsCopyingToNextMonth(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusBadge = (invoice: Invoice) => {
    if (invoice.statusPayment) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Оплачен
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <XCircle className="h-3 w-3 mr-1" />
        Не оплачен
      </Badge>
    );
  };

  // Генерируем даты только для выбранного месяца/года
  const courseDates = course
    ? (() => {
        const currentDate = new Date();
        const targetYear = year || currentDate.getFullYear();
        const targetMonth = month || currentDate.getMonth() + 1;

        // Определяем начало и конец месяца
        const monthStart = new Date(targetYear, targetMonth - 1, 1);
        const monthEnd = new Date(targetYear, targetMonth, 0);

        // Определяем реальные границы курса в этом месяце
        const courseStart = new Date(course.startDate);
        const courseEnd = new Date(course.endDate);

        // Берем пересечение: максимум из начал и минимум из концов
        const effectiveStart = new Date(
          Math.max(monthStart.getTime(), courseStart.getTime())
        );
        const effectiveEnd = new Date(
          Math.min(monthEnd.getTime(), courseEnd.getTime())
        );

        // Если курс не пересекается с выбранным месяцем
        if (effectiveStart > effectiveEnd) {
          return [];
        }

        return generateCourseDates(
          effectiveStart.toISOString().split("T")[0],
          effectiveEnd.toISOString().split("T")[0],
          course.weekdays
        );
      })()
    : [];

  // Логика посещаемости перенесена в StudentAttendanceCell

  if (!course) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Студенты курса</CardTitle>
          <CardDescription>
            Выберите курс в таблице выше, чтобы посмотреть список студентов
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Студенты курса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">
                Загрузка студентов...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Студенты курса</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Расчеты доходов
  const totalSum = invoices.reduce((sum, invoice) => sum + invoice.sum, 0);
  const paidSum = invoices
    .filter((invoice) => invoice.statusPayment)
    .reduce((sum, invoice) => sum + invoice.sum, 0);
  const paidCount = invoices.filter((invoice) => invoice.statusPayment).length;

  // Функции расчета доходов как в калькуляторе
  const taxAndCommissionRate = 10; // 6% налоги + 4% банк
  const teacherShare = 0.7; // 70% преподавателю
  const companyShare = 0.3; // 30% компании

  const calculateTeacherIncome = (
    grossIncome: number,
    rentTotal: number = 0
  ) => {
    const taxAndCommission = Math.round(
      grossIncome * (taxAndCommissionRate / 100)
    );
    const afterTax = grossIncome - taxAndCommission;
    const net = afterTax - rentTotal;
    const result = Math.max(0, Math.round(net * teacherShare));

    return result;
  };

  const calculateCompanyProfit = (
    grossIncome: number,
    rentTotal: number = 0
  ) => {
    const taxAndCommission = Math.round(
      grossIncome * (taxAndCommissionRate / 100)
    );
    const afterTax = grossIncome - taxAndCommission;
    const net = afterTax - rentTotal;
    return Math.max(0, Math.round(net * companyShare));
  };

  // Расчеты для оплаченных студентов
  const rentPerLesson = course?.isOnline ? 0 : course?.rentalPrice || 0;
  // Используем реальное количество занятий из календаря
  const actualLessonsCount = courseDates.length;
  const rentTotal = rentPerLesson * actualLessonsCount;

  // Отладка
  console.log("Course financial data:", {
    isOnline: course?.isOnline,
    rentalPrice: course?.rentalPrice,
    rentPerLesson,
    actualLessonsCount,
    rentTotal,
    paidSum,
    totalSum,
    paidCount,
  });

  // Учитываем аренду для офлайн курсов
  const teacherIncomeFromPaid = calculateTeacherIncome(paidSum, rentTotal);
  const teacherIncomeFromTotal = calculateTeacherIncome(totalSum, rentTotal);
  const companyProfitFromPaid = calculateCompanyProfit(paidSum, rentTotal);
  const companyProfitFromTotal = calculateCompanyProfit(totalSum, rentTotal);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Студенты курса</CardTitle>
        <CardDescription className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              Всего записаны: {invoices.length} студентов • Оплатили:{" "}
              {paidCount} студентов
              {attendanceManager.isUpdating && " • Сохраняется..."}
              {attendanceManager.hasPendingUpdates &&
                " • Есть несохраненные изменения"}
            </span>

            {/* Кнопки управления студентами */}
            {invoices.length > 0 && (
              <div className="flex items-center gap-1">
                {/* Кнопка копирования списка студентов */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyStudentsList}
                      className="h-6 w-6 p-0 hover:bg-gray-100"
                    >
                      <Users className="h-4 w-4 text-gray-900 hover:text-blue-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-white">Скопировать список студентов</p>
                  </TooltipContent>
                </Tooltip>

                {/* Кнопка массовой отправки сообщений - только для менеджеров */}
                {role === "Manager" && (
                  <Dialog
                    open={isBulkDialogOpen}
                    onOpenChange={setIsBulkDialogOpen}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isBulkSending}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <MessageSquare className="h-4 w-4 text-gray-900 hover:text-green-600" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-white">
                          Отправить сообщения с оплатой всем студентам
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Массовая отправка сообщений</DialogTitle>
                        <DialogDescription>
                          Вы действительно хотите отправить сообщения с
                          информацией об оплате всем студентам курса?
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4">
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Курс:</strong> {course.direction}
                          </p>
                          <p>
                            <strong>Выбранный период:</strong> {month || 'не указан'}/{year || 'не указан'}
                          </p>
                          <p>
                            <strong>Всего студентов:</strong> {invoices.length}
                          </p>
                          <p>
                            <strong>С верифицированными контактами:</strong>{" "}
                            {
                              invoices.filter(
                                (invoice) =>
                                  invoice.owner &&
                                  ((invoice.owner.whatsapp_phone_verified &&
                                    invoice.owner.whatsapp_phone) ||
                                    (invoice.owner.telegram_phone_verified &&
                                      invoice.owner.telegram_chat_id))
                              ).length
                            }
                          </p>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Внимание:</strong> Сообщения будут
                            отправлены только студентам с верифицированными
                            номерами телефонов в WhatsApp или Telegram.
                            Приоритет отдается WhatsApp.
                          </p>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsBulkDialogOpen(false)}
                        >
                          Отмена
                        </Button>
                        <Button
                          onClick={handleBulkSendPaymentMessages}
                          disabled={isBulkSending}
                        >
                          {isBulkSending
                            ? "Отправляется..."
                            : "Отправить сообщения"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {/* Кнопка копирования счетов на следующий месяц - только для менеджеров */}
                {role === "Manager" && (
                  <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isCopyingToNextMonth}
                            className="h-6 w-6 p-0 hover:bg-gray-100"
                          >
                            <CalendarDays className="h-4 w-4 text-gray-900 hover:text-blue-600" />
                          </Button>
                        </DialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-white">Копировать счета на следующий месяц</p>
                      </TooltipContent>
                    </Tooltip>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Копирование счетов на следующий месяц</DialogTitle>
                        <DialogDescription>
                          Создать новые счета для всех студентов на следующий месяц с учетом расписания курса?
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4">
                        <div className="space-y-2 text-sm">
                          <p><strong>Курс:</strong> {course.direction}</p>
                          <p><strong>Текущий период:</strong> {month || new Date().getMonth() + 1}/{year || new Date().getFullYear()}</p>
                          <p><strong>Новый период:</strong> {
                            (() => {
                              const currentMonth = month || new Date().getMonth() + 1;
                              const currentYear = year || new Date().getFullYear();
                              let nextMonth = currentMonth + 1;
                              let nextYear = currentYear;
                              if (nextMonth > 12) {
                                nextMonth = 1;
                                nextYear += 1;
                              }
                              return `${nextMonth}/${nextYear}`;
                            })()
                          }</p>
                          <p><strong>Студентов для копирования:</strong> {invoices.length}</p>
                          <p><strong>Стоимость за занятие:</strong> {course.pricePerLesson} {course.currency}</p>
                          {course.weekdays && (
                            <p><strong>Дни недели:</strong> {
                              course.weekdays.map(day => {
                                const dayNames: Record<string, string> = {
                                  monday: 'Пн', tuesday: 'Вт', wednesday: 'Ср',
                                  thursday: 'Чт', friday: 'Пт', saturday: 'Сб', sunday: 'Вс'
                                };
                                return dayNames[day] || day;
                              }).join(', ')
                            }</p>
                          )}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Внимание:</strong> Будут созданы новые неоплаченные счета с датами следующего месяца,
                            учитывающими дни недели курса. Сумма будет рассчитана как: стоимость_за_занятие × количество_занятий_в_месяце.
                            Существующие счета не будут дублироваться.
                          </p>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCopyDialogOpen(false)}
                        >
                          Отмена
                        </Button>
                        <Button
                          onClick={handleCopyToNextMonth}
                          disabled={isCopyingToNextMonth}
                        >
                          {isCopyingToNextMonth ? "Копируется..." : "Создать счета"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            )}

            {/* Dialog с результатами массовой отправки */}
            {bulkResults && (
              <Dialog
                open={isResultsDialogOpen}
                onOpenChange={setIsResultsDialogOpen}
              >
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Результаты массовой отправки</DialogTitle>
                    <DialogDescription>
                      Детальная информация о результатах отправки сообщений
                      студентам
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    {/* Общая статистика */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {bulkResults.total}
                        </div>
                        <div className="text-sm text-blue-800">
                          Всего студентов
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {bulkResults.sent}
                        </div>
                        <div className="text-sm text-green-800">Отправлено</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {bulkResults.failed}
                        </div>
                        <div className="text-sm text-red-800">Ошибок</div>
                      </div>
                    </div>

                    {/* Детальный список */}
                    <div className="max-h-80 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Студент</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Мессенджер</TableHead>
                            <TableHead>Ошибка</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkResults.details?.map(
                            (detail: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {detail.studentName}
                                </TableCell>
                                <TableCell>
                                  {detail.success ? (
                                    <Badge
                                      variant="default"
                                      className="bg-green-100 text-green-800"
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Отправлено
                                    </Badge>
                                  ) : (
                                    <Badge
                                      variant="destructive"
                                      className="bg-red-100 text-red-800"
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Ошибка
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {detail.messenger ? (
                                    <Badge
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {detail.messenger === "whatsapp"
                                        ? "📱 WhatsApp"
                                        : "📱 Telegram"}
                                    </Badge>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {detail.error ? (
                                    <span className="text-sm text-red-600">
                                      {detail.error}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Экспорт результатов в текст
                        const exportText = `Результаты массовой отправки сообщений
Курс: ${course.direction}
Дата: ${new Date().toLocaleString("ru-RU")}

Общая статистика:
- Всего студентов: ${bulkResults.total}
- Отправлено: ${bulkResults.sent}
- Ошибок: ${bulkResults.failed}

Детальные результаты:
${bulkResults.details
  ?.map(
    (detail: any, index: number) =>
      `${index + 1}. ${detail.studentName} - ${
        detail.success
          ? `Отправлено (${detail.messenger})`
          : `Ошибка: ${detail.error}`
      }`
  )
  .join("\n")}`;

                        navigator.clipboard.writeText(exportText);
                        toast.success("Результаты скопированы в буфер обмена");
                      }}
                    >
                      📋 Копировать отчет
                    </Button>
                    <Button onClick={() => setIsResultsDialogOpen(false)}>
                      Закрыть
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
            
          {/* Краткая информация о сумме с подробным tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex items-center gap-1 cursor-help">
                <CreditCard className="h-4 w-4" />
                {role === "Teacher"
                  ? `${teacherIncomeFromPaid.toLocaleString(
                      "ru-RU"
                    )}/${teacherIncomeFromTotal.toLocaleString("ru-RU")} ${
                      course.currency
                    }`
                  : `${paidSum.toLocaleString(
                      "ru-RU"
                    )}/${totalSum.toLocaleString("ru-RU")} ${course.currency}`}
                <Info className="h-3 w-3 text-gray-400" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs text-white">
              {role === "Teacher" ? (
                // Tooltip для преподавателя
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-white">Ваш доход</div>
                  <div className="text-white">
                    К выплате от оплативших:{" "}
                    <span className="font-medium">
                      {teacherIncomeFromPaid.toLocaleString("ru-RU")}{" "}
                      {course.currency}
                    </span>
                  </div>
                  <div className="text-white">
                    Потенциально от всех:{" "}
                    <span className="font-medium">
                      {teacherIncomeFromTotal.toLocaleString("ru-RU")}{" "}
                      {course.currency}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 border-t border-gray-600 pt-2">
                    Расчет: Валовый доход - 10% (налоги + банк){" "}
                    {rentTotal > 0 &&
                      `- аренда (${rentTotal.toLocaleString("ru-RU")} ${
                        course.currency
                      })`}{" "}
                    × 70% (ваша доля)
                  </div>
                </div>
              ) : (
                // Tooltip для менеджера
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-white">
                    Финансовая сводка
                  </div>
                  <div className="text-white">
                    Валовый доход:{" "}
                    <span className="font-medium">
                      {paidSum.toLocaleString("ru-RU")}/
                      {totalSum.toLocaleString("ru-RU")} {course.currency}
                    </span>
                  </div>
                  <div className="text-white">
                    К выплате преподавателю:{" "}
                    <span className="font-medium">
                      {teacherIncomeFromPaid.toLocaleString("ru-RU")}/
                      {teacherIncomeFromTotal.toLocaleString("ru-RU")}{" "}
                      {course.currency}
                    </span>
                  </div>
                  <div className="text-white">
                    Прибыль компании:{" "}
                    <span className="font-medium">
                      {companyProfitFromPaid.toLocaleString("ru-RU")}/
                      {companyProfitFromTotal.toLocaleString("ru-RU")}{" "}
                      {course.currency}
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 border-t border-gray-600 pt-2">
                    Расчет: Валовый доход - 10% (налоги + банк){" "}
                    {rentTotal > 0 &&
                      `- аренда (${rentTotal.toLocaleString("ru-RU")} ${
                        course.currency
                      })`}{" "}
                    → 70% преподавателю, 30% компании
                  </div>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </CardDescription>
      </CardHeader>

      {invoices.length === 0 ? (
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-600">
              На этот курс пока никто не записался
            </p>
          </div>
        </CardContent>
      ) : (
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Студент</TableHead>
                  {/* Столбцы суммы и оплаты только для менеджеров */}
                  {role === "Manager" && (
                    <>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Статус оплаты</TableHead>
                    </>
                  )}
                  {courseDates.map((courseDate, index) => (
                    <TableHead key={index} className="text-center min-w-12">
                      <div className="text-xs">
                        <div>{formatAttendanceDate(courseDate.date)}</div>
                        <div className="text-gray-500">
                          {courseDate.dayName.slice(0, 2)}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center w-16">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.documentId}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {invoice.name} {invoice.family}
                        </p>
                        {invoice.tinkoffOrderId && (
                          <p className="text-sm text-gray-500">
                            ID: {invoice.tinkoffOrderId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    {/* Столбцы суммы и оплаты только для менеджеров */}
                    {role === "Manager" && (
                      <>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">
                              {invoice.sum} {invoice.currency}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(invoice)}</TableCell>
                      </>
                    )}
                    {courseDates.map((courseDate, index) => {
                      // Проверяем, входит ли эта дата в персональный период студента
                      const studentStartDate = new Date(invoice.startDate);
                      const studentEndDate = new Date(invoice.endDate);
                      const isInStudentPeriod =
                        courseDate.date >= studentStartDate &&
                        courseDate.date <= studentEndDate;
                      const dateKey = courseDate.date
                        .toISOString()
                        .split("T")[0];

                      return (
                        <TableCell key={index} className="text-center">
                          {isInStudentPeriod ? (
                            <StudentAttendanceCell
                              status={attendanceManager.getAttendanceStatus(
                                invoice.documentId,
                                dateKey
                              )}
                              isPending={attendanceManager.isPending(
                                invoice.documentId,
                                dateKey
                              )}
                              hasError={attendanceManager.hasError(
                                invoice.documentId
                              )}
                              onClick={() => {
                                const currentStatus =
                                  attendanceManager.getAttendanceStatus(
                                    invoice.documentId,
                                    dateKey
                                  );
                                let newStatus: AttendanceStatus;
                                if (currentStatus === "unknown") {
                                  newStatus = "present";
                                } else if (currentStatus === "present") {
                                  newStatus = "absent";
                                } else {
                                  newStatus = "unknown";
                                }
                                attendanceManager.updateAttendance(
                                  invoice.documentId,
                                  dateKey,
                                  newStatus
                                );
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      <StudentActionsDropdown
                        studentId={invoice.documentId}
                        studentName={invoice.name}
                        studentFamily={invoice.family}
                        invoiceDocumentId={invoice.documentId}
                        courseId={course.documentId}
                        onStudentDeleted={handleStudentDeleted}
                        onStudentUpdated={handleStudentDeleted}
                        role={role}
                        courseStartTime={course.startTime}
                        courseEndTime={course.endTime}
                        courseTimezone={course.timezone}
                        courseWeekdays={course.weekdays}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
