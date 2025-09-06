"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessengerInput } from "@/components/ui/messenger-input";
import { DatePicker } from "@/components/ui/date-picker";
import { userAuthAPI } from "@/entities/user/api/auth";
import { useUser } from "@/entities/user/model/store";
import { toast } from "sonner";
import { format } from "date-fns";

interface ContactStepProps {
  onNext: () => void;
  onDataChange: (data: ContactData) => void;
  initialData?: ContactData;
}

export interface ContactData {
  firstName: string;
  lastName: string;
  whatsappPhone: string;
  telegramPhone: string;
  telegramUsername: string;
  messenger: "whatsapp" | "telegram";
  telegramMode: "phone" | "username";
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
  const [telegramPhone, setTelegramPhone] = useState(
    initialData?.telegramPhone || ""
  );
  const [telegramUsername, setTelegramUsername] = useState(
    initialData?.telegramUsername || ""
  );
  const [telegramMode, setTelegramMode] = useState<"phone" | "username">(
    initialData?.telegramMode || "phone"
  );
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    initialData?.birthDate
  );
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, token } = useUser();

  // Функция для получения текущего значения контакта
  const getCurrentContactValue = () => {
    if (messenger === "whatsapp") {
      return whatsappPhone;
    } else if (messenger === "telegram") {
      return telegramMode === "phone" ? telegramPhone : telegramUsername;
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
        telegramPhone,
        telegramUsername,
        messenger,
        telegramMode,
        birthDate,
      });
    } else if (messenger === "telegram") {
      if (telegramMode === "phone") {
        setTelegramPhone(safeValue);
        onDataChange({
          firstName,
          lastName,
          whatsappPhone,
          telegramPhone: safeValue,
          telegramUsername,
          messenger,
          telegramMode,
          birthDate,
        });
      } else {
        setTelegramUsername(safeValue);
        onDataChange({
          firstName,
          lastName,
          whatsappPhone,
          telegramPhone,
          telegramUsername: safeValue,
          messenger,
          telegramMode,
          birthDate,
        });
      }
    }
  };

  const handleInputChange = (field: keyof ContactData, value: any) => {
    const newData = {
      firstName,
      lastName,
      whatsappPhone,
      telegramPhone,
      telegramUsername,
      messenger,
      telegramMode,
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
      case "telegramMode":
        setTelegramMode(value);
        break;
      case "birthDate":
        setBirthDate(value);
        break;
    }

    onDataChange(newData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !token) {
      console.error('Пользователь не авторизован');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Подготавливаем данные для обновления профиля
      const updateData = {
        name: firstName,
        family: lastName,
        whatsapp_phone: messenger === 'whatsapp' ? whatsappPhone : undefined,
        telegram_phone: messenger === 'telegram' && telegramMode === 'phone' ? telegramPhone : undefined,
        telegram_username: messenger === 'telegram' && telegramMode === 'username' ? telegramUsername : undefined,
        birth_date: birthDate ? format(birthDate, 'yyyy-MM-dd') : undefined,
      };
      
      // Обновляем профиль пользователя
      await userAuthAPI.updateUser(user.id, updateData, token);
      
      // Показываем уведомление об успехе
      toast.success("Данные успешно сохранены");
      
      // Переходим к следующему шагу
      onNext();
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast.error("Ошибка при сохранении данных");
    } finally {
      setIsLoading(false);
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
            telegramMode={telegramMode}
            onTelegramModeChange={(value) =>
              handleInputChange("telegramMode", value)
            }
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
    </Card>
  );
}
