'use client'

import { useUser } from "@/entities/user"
import { ProfileHeader } from "@/widgets/profile-header"
import { ProfileTabs } from "@/widgets/profile-tabs"
import { useState, useEffect } from "react"
import { type User } from "@/entities/user"

interface ProfilePageProps {
  params: Promise<{ userId: string }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [userId, setUserId] = useState<string>('')
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  const { user: currentUser } = useUser()

  // Получаем userId из params
  useEffect(() => {
    params.then(({ userId: id }) => {
      setUserId(id)
    })
  }, [params])

  // Определяем, чей профиль просматриваем
  useEffect(() => {
    if (currentUser && userId) {
      const isOwn =
        currentUser.documentId === userId ||
        currentUser.id.toString() === userId
      setIsOwnProfile(isOwn)

      if (isOwn) {
        // Если это собственный профиль, используем данные из контекста
        setProfileUser(currentUser)
        setLoading(false)
      } else {
        // TODO: В будущем здесь будет API запрос для получения профиля другого пользователя
        // Пока показываем заглушку
        setProfileUser(null)
        setLoading(false)
      }
    }
  }, [currentUser, userId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500">Загрузка профиля...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isOwnProfile && !profileUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Профиль не найден
          </h1>
          <p className="text-gray-500">
            Пользователь с ID {userId} не существует или недоступен
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className=" mx-auto px-4 py-8">
        {/* Заголовок профиля */}
        <ProfileHeader
          user={profileUser}
          isOwnProfile={isOwnProfile}
        />

        {/* Табы с контентом */}
        <div className="mt-8">
          <ProfileTabs user={profileUser} />
        </div>
      </div>
    </div>
  )
}