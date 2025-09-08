"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useUser } from "@/entities/user";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { invoiceAPI, type TinkoffPaymentData } from "@/entities/invoice";
import type { Invoice } from "@/entities/invoice";
import type { Course } from "@/entities/course/model/types";

interface PaymentFormProps {
  invoice: Invoice;
  course: Course;
  className?: string;
}

export function PaymentForm({ invoice, course, className }: PaymentFormProps) {
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const { user } = useUser();

  // Функция для вычисления возраста по дате рождения
  const calculateAge = (birthDate: Date | string | undefined) => {
    if (!birthDate) return "";

    const today = new Date();
    const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
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

  const handlePayment = async () => {
    // Базовые проверки
    if (invoice.statusPayment) {
      alert("Счет уже оплачен");
      return;
    }

    // Валидация данных invoice
    if (!invoice.sum || invoice.sum <= 0) {
      alert("Неверная сумма счета");
      return;
    }

    if (!invoice.documentId) {
      alert("Отсутствует идентификатор счета");
      return;
    }

    // Валидация данных курса
    if (!course.documentId) {
      alert("Отсутствует идентификатор курса");
      return;
    }

    setIsPaymentProcessing(true);

    try {
      // Создаем платеж через Tinkoff (анонимно, используя данные из invoice)
      const paymentData: TinkoffPaymentData = {
        users_permissions_user: invoice.owner?.documentId || undefined, // Используем owner из invoice
        course: course.documentId,
        amount: invoice.sum,
        currency: invoice.currency || 'RUB',
        invoiceId: invoice.documentId
      };

      const paymentResponse = await invoiceAPI.createTinkoffPayment(paymentData);

      if (paymentResponse?.paymentUrl) {
        // Перенаправляем на страницу оплаты Tinkoff
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error("Сервер не вернул ссылку на оплату");
      }
    } catch (error) {
      console.error("Ошибка при создании платежа:", error);
      
      // Более детальная обработка ошибок
      let errorMessage = "Произошла ошибка при создании платежа.";
      
      if (error instanceof Error) {
        if (error.message.includes("Network")) {
          errorMessage = "Проблема с сетевым соединением. Проверьте интернет и попробуйте еще раз.";
        } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorMessage = "Сессия истекла. Пожалуйста, войдите в систему заново.";
        } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
          errorMessage = "Недостаточно прав для создания платежа.";
        } else if (error.message.includes("404")) {
          errorMessage = "Счет или курс не найден.";
        } else if (error.message.includes("500")) {
          errorMessage = "Ошибка сервера. Попробуйте позже или обратитесь в поддержку.";
        } else {
          errorMessage = `Ошибка: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "dd MMMM yyyy", { locale: ru });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'RUB' ? 'RUB' : 'USD',
    }).format(price);
  };

  return (
    <Card className="p-6 gap-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {invoice.statusPayment ? "Счет оплачен" : "Оплата счета"}
        </h1>
        <p className="text-sm text-gray-600">
          {invoice.statusPayment 
            ? "Этот счет уже был успешно оплачен."
            : "Проверьте данные и перейдите к оплате."
          }
        </p>
      </div>

        <div className="space-y-6">
          {/* Информация о курсе */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Курс</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Описание:</span> {course.description}
              </p>
              <p>
                <span className="font-medium">Преподаватель:</span>{" "}
                {course.teacher?.name} {course.teacher?.family}
              </p>
              <p>
                <span className="font-medium">Направление:</span> {course.direction}
              </p>
            </div>
          </div>

          {/* Информация о студенте из счета */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Студент</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Имя:</span> {invoice.name} {invoice.family}
              </p>
            </div>
          </div>

          {/* Информация о контактном лице (владельце счета) */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Контактное лицо</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Email:</span> {invoice.owner?.email || "Не указан"}
              </p>
              {invoice.owner?.name && invoice.owner?.family && (
                <p>
                  <span className="font-medium">Имя:</span> {invoice.owner.name} {invoice.owner.family}
                </p>
              )}
            </div>
          </div>

          {/* Информация о счете */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Детали оплаты</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Период:</span>{" "}
                {formatDate(invoice.startDate)} - {formatDate(invoice.endDate)}
              </p>
              <p>
                <span className="font-medium">Сумма:</span>{" "}
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(invoice.sum, invoice.currency)}
                </span>
              </p>
              <p>
                <span className="font-medium">Статус:</span>{" "}
                <span className={invoice.statusPayment ? "text-green-600" : "text-orange-600"}>
                  {invoice.statusPayment ? "Оплачен" : "Ожидает оплаты"}
                </span>
              </p>
              {invoice.paymentDate && (
                <p>
                  <span className="font-medium">Дата оплаты:</span>{" "}
                  {formatDate(invoice.paymentDate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Кнопка оплаты */}
        {!invoice.statusPayment && (
          <>
            <div className="mt-6">
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={isPaymentProcessing}
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создание платежа...
                  </>
                ) : (
                  `Оплатить ${formatPrice(invoice.sum, invoice.currency)}`
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              После нажатия кнопки вы будете перенаправлены на защищенную страницу оплаты Tinkoff
            </p>
          </>
        )}

        {/* Если счет уже оплачен */}
        {invoice.statusPayment && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-center font-medium">
              ✅ Счет успешно оплачен
            </p>
            {invoice.paymentDate && (
              <p className="text-green-700 text-center text-sm mt-1">
                Дата оплаты: {formatDate(invoice.paymentDate)}
              </p>
            )}
          </div>
        )}
    </Card>
  );
}