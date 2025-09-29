'use client'

import { useUser } from "@/entities/user";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirectPage() {
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Перенаправляем на профиль с userId (documentId или fallback на id)
      redirect(`/profile/${user.documentId || user.id}`);
    } else {
      // Если не авторизован, перенаправляем на страницу входа
      redirect('/auth/login');
    }
  }, [isAuthenticated, user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Загрузка профиля...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    </div>
  )
}