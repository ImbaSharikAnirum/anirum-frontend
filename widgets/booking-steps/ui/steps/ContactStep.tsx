"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessengerInput } from "@/components/ui/messenger-input";
import { DatePicker } from "@/components/ui/date-picker";
import { useUser } from "@/entities/user/model/store";
import { toast } from "sonner";
import { format } from "date-fns";
import { VerificationDialog } from "../components/VerificationDialog";

interface ContactStepProps {
  onNext: () => void;
  onDataChange: (data: ContactData) => void;
  initialData?: ContactData;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  whatsappPhone: string;
  telegramUsername: string;
  messenger: "whatsapp" | "telegram";
  birthDate?: Date;
}

export function ContactStep({
  onNext,
  onDataChange,
  initialData,
}: ContactStepProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [messenger, setMessenger] = useState<"whatsapp" | "telegram">(
    initialData?.messenger || "whatsapp"
  );
  const [whatsappPhone, setWhatsappPhone] = useState(
    initialData?.whatsappPhone || ""
  );
  const [telegramUsername, setTelegramUsername] = useState(
    initialData?.telegramUsername || ""
  );
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    initialData?.birthDate
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);

  const { user, updateUser } = useUser();

  // Функция для получения текущего значения контакта
  const getCurrentContactValue = () => {
    if (messenger === "whatsapp") {
      return whatsappPhone;
    } else if (messenger === "telegram") {
      return telegramUsername;
    }
    return "";
  };

  // Функция для установки значения контакта
  const setCurrentContactValue = (value: string | undefined) => {
    const safeValue = value || "";

    if (messenger === "whatsapp") {
      setWhatsappPhone(safeValue);
      onDataChange({
        firstName,
        lastName,
        whatsappPhone: safeValue,
        telegramUsername,
        messenger,
        birthDate,
      });
    } else if (messenger === "telegram") {
      setTelegramUsername(safeValue);
      onDataChange({
        firstName,
        lastName,
        whatsappPhone,
        telegramUsername: safeValue,
        messenger,
        birthDate,
      });
    }
  };

  const handleInputChange = (field: keyof ContactData, value: any) => {
    const newData = {
      firstName,
      lastName,
      whatsappPhone,
      telegramUsername,
      messenger,
      birthDate,
      [field]: value,
    };

    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "messenger":
        setMessenger(value);
        break;
      case "birthDate":
        setBirthDate(value);
        break;
    }

    onDataChange(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    setIsLoading(true);

    try {
      // Проверяем нужна ли верификация номера СНАЧАЛА
      const currentPhone = getCurrentContactValue();
      const needsVerification = messenger === 'whatsapp'
        ? !user.whatsapp_phone_verified
        : !user.telegram_phone_verified;

      if (needsVerification && currentPhone) {
        // Если нужна верификация - показываем диалог БЕЗ сохранения данных
        setShowVerificationDialog(true);
      } else {
        // Если верификация не нужна - сохраняем данные и переходим дальше
        await saveUserData();
        onNext();
      }
    } catch (error) {
      console.error('Ошибка:', error);
      toast.error("Произошла ошибка");
    } finally {
      setIsLoading(false);
    }
  };

  // Функция сохранения данных (вызывается после верификации или сразу)
  const saveUserData = async () => {
    const updateData = {
      name: firstName,
      family: lastName,
      whatsapp_phone: messenger === 'whatsapp' ? whatsappPhone : undefined,
      telegram_username: messenger === 'telegram' ? telegramUsername : undefined,
      birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : undefined,
    };

    await updateUser(updateData);
    toast.success("Данные успешно сохранены");
  };

  // Обработчик успешной верификации
  const handleVerificationSuccess = async () => {
    try {
      // Сохраняем данные ПОСЛЕ успешной верификации
      await saveUserData();
      // Переходим к следующему шагу
      onNext();
    } catch (error) {
      console.error('Ошибка сохранения данных после верификации:', error);
      toast.error("Ошибка при сохранении данных");
    }
  };

  return (
    <Card className="p-6 gap-3">
      <h3 className="text-lg font-medium ">Укажите ваши данные</h3>
      <p className="text-sm text-gray-600 mb-4">
        На этом этапе записываете данные того, кто записывается. Данные ученика
        заполните на следующем этапе.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Имя, фамилия и дата рождения */}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="Введите имя"
              className="w-auto min-w-[140px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Введите фамилию"
              className="w-auto min-w-[140px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Дата рождения</Label>
            <DatePicker
              selected={birthDate}
              onSelect={(date) => handleInputChange("birthDate", date)}
              placeholder="дд.мм.гггг"
              className="w-auto"
            />
          </div>
        </div>

        {/* Мессенджер для связи */}
        <div className="space-y-2">
          <Label>Мессенджер для связи</Label>
          <MessengerInput
            messenger={messenger}
            onMessengerChange={(value) => handleInputChange("messenger", value)}
            value={getCurrentContactValue()}
            onValueChange={setCurrentContactValue}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!firstName || !lastName || !birthDate || !getCurrentContactValue() || isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Далее'}
        </Button>
      </form>

      {/* Диалог верификации номера */}
      <VerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        phone={getCurrentContactValue()}
        messenger={messenger}
        onSuccess={handleVerificationSuccess}
      />
    </Card>
  );
}
