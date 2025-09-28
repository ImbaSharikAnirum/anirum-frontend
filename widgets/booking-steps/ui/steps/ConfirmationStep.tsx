"use client";

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/entities/user";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { canDirectPayment } from "@/shared/lib/booking-utils";
import { calculateProRatedPricing } from "@/shared/lib/course-pricing";
import { ReferralCodeInput } from "@/shared/ui/referral-code-input";
import { BonusInput } from "@/shared/ui/bonus-input";
import type { ContactData } from "./ContactStep";
import type { StudentData } from "./StudentStep";
import type { Course } from "@/entities/course/model/types";
import type { Invoice } from "@/entities/invoice";
import type { ValidateCodeResponse, AppliedReferral } from "@/entities/referral";

export interface BookingData {
  referralData?: AppliedReferral;
  bonusesUsed: number;
}

interface ConfirmationStepProps {
  course: Course;
  contactData: ContactData;
  studentData: StudentData;
  selectedMonth: number;
  selectedYear: number;
  monthlyInvoices: Invoice[];
  onBack: () => void;
  onConfirm: (bookingData: BookingData) => void;
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
  
  // Состояние для промокода и бонусов
  const [appliedReferral, setAppliedReferral] = useState<AppliedReferral | null>(null);
  const [bonusesUsed, setBonusesUsed] = useState<number>(0);
  
  // Расчет базовой стоимости курса
  const pricing = useMemo(() => {
    return calculateProRatedPricing({
      fromDate: new Date(),
      year: selectedYear,
      month: selectedMonth - 1,
      pricePerLesson: course.pricePerLesson,
      currency: course.currency,
      weekdays: course.weekdays,
      courseStartDate: course.startDate,
      courseEndDate: course.endDate,
    });
  }, [course, selectedMonth, selectedYear]);

  // Расчет финальной цены с учетом скидок и бонусов
  const finalPricing = useMemo(() => {
    const basePrice = pricing.proRatedPrice;
    const discountAmount = appliedReferral?.discountAmount || 0;
    const finalPrice = Math.max(0, basePrice - discountAmount - bonusesUsed);
    
    return {
      basePrice,
      discountAmount,
      bonusesUsed,
      finalPrice,
    };
  }, [pricing.proRatedPrice, appliedReferral, bonusesUsed]);

  // Обработчики промокода
  const handleValidReferralCode = (result: ValidateCodeResponse) => {
    if (result.isValid && result.referralCode && result.discountAmount && result.referrer) {
      setAppliedReferral({
        code: result.referralCode.code,
        discountAmount: result.discountAmount,
        referralCodeId: result.referralCode.documentId,
        referrerId: result.referrer.documentId,
      });
    }
  };

  const handleInvalidReferralCode = () => {
    setAppliedReferral(null);
  };

  // Обработчик изменения бонусов
  const handleBonusChange = (amount: number) => {
    setBonusesUsed(amount);
  };

  const handleConfirm = () => {
    onConfirm({
      referralData: appliedReferral || undefined,
      bonusesUsed
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + '₽';
  };

  // Функция для получения текущего значения контакта
  const getCurrentContactValue = () => {
    if (contactData.messenger === "whatsapp") {
      return contactData.whatsappPhone;
    } else if (contactData.messenger === "telegram") {
      return contactData.telegramUsername;
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
                Username
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

        {/* Промокод */}
        <div className="border rounded-lg p-4">
          <ReferralCodeInput
            coursePrice={pricing.proRatedPrice}
            onValidCode={handleValidReferralCode}
            onInvalidCode={handleInvalidReferralCode}
          />
        </div>

        {/* Бонусы */}
        {user?.bonusBalance && user.bonusBalance > 0 && (
          <div className="border rounded-lg p-4">
            <BonusInput
              coursePrice={pricing.proRatedPrice}
              availableBalance={user.bonusBalance}
              discountAmount={finalPricing.discountAmount}
              onBonusChange={handleBonusChange}
            />
          </div>
        )}

        {/* Итоговая стоимость */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Стоимость</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Курс ({pricing.remainingLessons} занятий):</span>
              <span>{formatPrice(finalPricing.basePrice)}</span>
            </div>
            
            {appliedReferral && (
              <div className="flex justify-between text-green-600">
                <span>Промокод {appliedReferral.code}:</span>
                <span>-{formatPrice(finalPricing.discountAmount)}</span>
              </div>
            )}
            
            {bonusesUsed > 0 && (
              <div className="flex justify-between text-blue-600">
                <span>Бонусы:</span>
                <span>-{formatPrice(finalPricing.bonusesUsed)}</span>
              </div>
            )}
            
            <hr className="my-2" />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Итого к оплате:</span>
              <span>{formatPrice(finalPricing.finalPrice)}</span>
            </div>
            
            {(appliedReferral || bonusesUsed > 0) && (
              <p className="text-xs text-green-600 mt-2">
                Общая экономия: {formatPrice((finalPricing.discountAmount || 0) + (finalPricing.bonusesUsed || 0))}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Назад
        </Button>
        <Button className="flex-1" onClick={handleConfirm}>
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
