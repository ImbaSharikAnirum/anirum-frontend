"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  MessageCircle,
  User,
  Calendar,
  Trash2,
  Edit,
  Copy,
  MessageSquare,
} from "lucide-react";
import { invoiceAPI } from "@/entities/invoice/api/invoiceApi";
import { StudentContactDialog } from "./student-contact-dialog";
import { StudentEditDialog } from "./student-edit-dialog";
import { toast } from "sonner";
import { formatWeekdays } from "@/shared/lib/course-utils";
import { formatCourseSchedule } from "@/shared/lib/timezone-utils";
import { useUserTimezone } from "@/shared/hooks/useUserTimezone";

type UserRole = "Manager" | "Teacher";

interface StudentActionsDropdownProps {
  studentId: string;
  studentName: string;
  studentFamily: string;
  invoiceDocumentId: string;
  courseId?: string;
  className?: string;
  onStudentDeleted?: () => void;
  onStudentUpdated?: () => void;
  role?: UserRole;
  // Данные курса для расписания
  courseStartTime?: string;
  courseEndTime?: string;
  courseTimezone?: string;
  courseWeekdays?: string[];
}

export function StudentActionsDropdown({
  studentId,
  studentName,
  studentFamily,
  invoiceDocumentId,
  courseId,
  className,
  onStudentDeleted,
  onStudentUpdated,
  role = "Manager",
  courseStartTime,
  courseEndTime,
  courseTimezone,
  courseWeekdays,
}: StudentActionsDropdownProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { timezone: userTimezone, loading: timezoneLoading } =
    useUserTimezone();

  const handleContactClick = () => {
    if (!invoiceDocumentId) {
      console.warn("Нет ID счета для связи со студентом");
      return;
    }
    setIsDropdownOpen(false);
    setIsContactDialogOpen(true);
  };

  const handleEditClick = () => {
    setIsDropdownOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDropdownOpen(false);
    setIsDeleteDialogOpen(true);
  };

  const handleCopyPaymentLink = async () => {
    if (!courseId || !invoiceDocumentId) {
      toast.error("Ошибка создания ссылки");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin;
    const paymentUrl = `${baseUrl}/courses/${courseId}/payment/${invoiceDocumentId}`;

    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast.success("Ссылка счета скопирована");
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea");
      textArea.value = paymentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Ссылка счета скопирована");
    }

    setIsDropdownOpen(false);
  };

  const handleCopyPaymentMessage = async () => {
    if (!courseId || !invoiceDocumentId) {
      toast.error("Ошибка создания сообщения");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || window.location.origin;
    const paymentUrl = `${baseUrl}/courses/${courseId}/payment/${invoiceDocumentId}`;

    // Формируем информацию о расписании
    let scheduleInfo = "";
    if (courseWeekdays && courseWeekdays.length > 0) {
      const weekdaysText = formatWeekdays(courseWeekdays);

      if (courseStartTime && courseEndTime && courseTimezone) {
        // Всегда используем часовой пояс курса в сообщении для клиента
        // Убираем секунды из времени (16:00:00 -> 16:00)
        const formatTime = (time: string) => time.split(':').slice(0, 2).join(':');
        const timeInfo = `${formatTime(courseStartTime)} - ${formatTime(courseEndTime)} (${courseTimezone})`;
        scheduleInfo = `Занятия проходят: ${weekdaysText}, время: ${timeInfo}`;
      } else {
        scheduleInfo = `Занятия проходят: ${weekdaysText}`;
      }
    }

    const message = `Здравствуйте!

Для оплаты курса, пожалуйста, перейдите по ссылке:
${paymentUrl}

${
  scheduleInfo ? scheduleInfo + "\n\n" : ""
}Если у вас возникнут вопросы, обращайтесь к нам.
Спасибо!`;

    try {
      await navigator.clipboard.writeText(message);
      toast.success("Сообщение с оплатой скопировано");
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement("textarea");
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("Сообщение с оплатой скопировано");
    }

    setIsDropdownOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);

      // Токен автоматически передается через cookies (session)
      await invoiceAPI.deleteInvoice(invoiceDocumentId);

      setIsDeleteDialogOpen(false);
      onStudentDeleted?.();
      toast.success("Студент удален");
    } catch (error) {
      console.error("Ошибка при удалении студента:", error);
      toast.error("Ошибка при удалении студента");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleContactClick}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Связаться
          </DropdownMenuItem>
          {courseId && (
            <>
              <DropdownMenuItem onClick={handleCopyPaymentLink}>
                <Copy className="mr-2 h-4 w-4" />
                Ссылка оплаты
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyPaymentMessage}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Сообщение с оплатой
              </DropdownMenuItem>
            </>
          )}
          {/* Редактирование и удаление только для менеджеров */}
          {role === "Manager" && (
            <DropdownMenuItem onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            Профиль
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Calendar className="mr-2 h-4 w-4" />
            История
          </DropdownMenuItem>
          {role === "Manager" && (
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <StudentContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        studentName={studentName}
        studentFamily={studentFamily}
        invoiceDocumentId={invoiceDocumentId}
      />

      <StudentEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        invoiceDocumentId={invoiceDocumentId}
        onStudentUpdated={onStudentUpdated}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить студента</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить студента{" "}
              <span className="font-medium">
                {studentName} {studentFamily}
              </span>
              ?
              <br />
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
