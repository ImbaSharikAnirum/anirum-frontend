"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/entities/user";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { canDirectPayment } from "@/shared/lib/booking-utils";
import type { ContactData } from "./ContactStep";
import type { StudentData } from "./StudentStep";
import type { Course } from "@/entities/course/model/types";
import type { Invoice } from "@/entities/invoice";

interface ConfirmationStepProps {
  course: Course;
  contactData: ContactData;
  studentData: StudentData;
  selectedMonth: number;
  selectedYear: number;
  monthlyInvoices: Invoice[];
  onBack: () => void;
  onConfirm: () => void;
}

export function ConfirmationStep({
  course,
  contactData,
  studentData,
  selectedMonth,
  selectedYear,
  monthlyInvoices,
  onBack,
  onConfirm,
}: ConfirmationStepProps) {
  const { user } = useUser();
  const isDirectPayment = canDirectPayment(course, monthlyInvoices);

  // Функция для получения текущего значения контакта
  const getCurrentContactValue = () => {
    if (contactData.messenger === "whatsapp") {
      return contactData.whatsappPhone;
    } else if (contactData.messenger === "telegram") {
      return contactData.telegramMode === "phone"
        ? contactData.telegramPhone
        : contactData.telegramUsername;
    }
    return "";
  };

  // Функция для вычисления возраста по дате рождения
  const calculateAge = (birthDate: Date | string | undefined) => {
    if (!birthDate) return "";

    const today = new Date();
    const birth =
      typeof birthDate === "string" ? new Date(birthDate) : birthDate;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age.toString();
  };

  // Функция для получения возраста пользователя
  const getUserAge = () => {
    if (!user?.birth_date) return "";
    return calculateAge(user.birth_date);
  };

  return (
    <Card className="p-6 gap-2">
      <h3 className="text-lg font-medium">
        {isDirectPayment ? "Оплатить курс" : "Подтверждение бронирования"}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {isDirectPayment
          ? "Проверьте данные и перейдите к оплате курса."
          : "Проверьте данные и подтвердите бронирование."}
      </p>

      <div className="space-y-6">
        {/* Контактное лицо */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Контактное лицо</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Имя:</span> {contactData.firstName}{" "}
              {contactData.lastName}
            </p>
            <p>
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p>
              <span className="font-medium">Мессенджер:</span>{" "}
              {contactData.messenger === "whatsapp" ? "WhatsApp" : "Telegram"}
            </p>
            <p>
              <span className="font-medium">Контакт:</span>{" "}
              {getCurrentContactValue()}
            </p>
            {contactData.messenger === "telegram" && (
              <p>
                <span className="font-medium">Тип:</span>{" "}
                {contactData.telegramMode === "phone"
                  ? "Номер телефона"
                  : "Username"}
              </p>
            )}
          </div>
        </div>

        {/* Ученик */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Ученик</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {studentData.studentType === "myself" ? (
              <>
                <p>
                  <span className="font-medium">Имя:</span>{" "}
                  {contactData.firstName} {contactData.lastName}
                </p>
                {user?.birth_date && (
                  <>
                    <p>
                      <span className="font-medium">Дата рождения:</span>{" "}
                      {format(new Date(user.birth_date), "dd MMMM yyyy", {
                        locale: ru,
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Возраст:</span>{" "}
                      {getUserAge()} лет
                    </p>
                  </>
                )}
              </>
            ) : studentData.studentType === "existing" &&
              studentData.selectedStudent ? (
              <>
                <p>
                  <span className="font-medium">Имя:</span>{" "}
                  {studentData.selectedStudent.name}{" "}
                  {studentData.selectedStudent.family}
                </p>
                {studentData.selectedStudent.age && (
                  <>
                    <p>
                      <span className="font-medium">Дата рождения:</span>{" "}
                      {format(
                        new Date(studentData.selectedStudent.age),
                        "dd MMMM yyyy",
                        { locale: ru }
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Возраст:</span>{" "}
                      {calculateAge(studentData.selectedStudent.age)} лет
                    </p>
                  </>
                )}
              </>
            ) : studentData.studentType === "new" ? (
              <>
                <p>
                  <span className="font-medium">Имя:</span>{" "}
                  {studentData.studentFirstName} {studentData.studentLastName}
                </p>
                {studentData.studentBirthDate && (
                  <>
                    <p>
                      <span className="font-medium">Дата рождения:</span>{" "}
                      {format(studentData.studentBirthDate, "dd MMMM yyyy", {
                        locale: ru,
                      })}
                    </p>
                    <p>
                      <span className="font-medium">Возраст:</span>{" "}
                      {calculateAge(studentData.studentBirthDate)} лет
                    </p>
                  </>
                )}
              </>
            ) : (
              <p className="text-gray-400">Студент не выбран</p>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Назад
        </Button>
        <Button className="flex-1" onClick={onConfirm}>
          {isDirectPayment ? "Оплатить" : "Подтвердить бронирование"}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        {isDirectPayment &&
          "После создания счета вы будете перенаправлены на страницу оплаты"}
      </p>
    </Card>
  );
}
