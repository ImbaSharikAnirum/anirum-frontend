"use client"

import { PinterestLogin } from "@/shared/ui"
import { useUser } from "@/entities/user"

export default function GuidesPage() {
  const { user, isAuthenticated } = useUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">Гайды</h1>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Подключите Pinterest, чтобы импортировать пины и сохранить их как гайды
            </p>
            <PinterestLogin className="mx-auto">
              🎨 Подключить Pinterest
            </PinterestLogin>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Войдите в аккаунт, чтобы начать работу с гайдами
            </p>
            <a
              href="/auth/login"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Войти в аккаунт
            </a>
          </div>
        )}
      </div>
    </div>
  )
}