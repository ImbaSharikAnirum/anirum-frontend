/**
 * Заголовок профиля пользователя с аватаром, уровнем и именем
 * @layer widgets/profile-header
 */

'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { type User } from "@/entities/user"

interface ProfileHeaderProps {
  user: User | null
  isOwnProfile?: boolean
}

export function ProfileHeader({ user, isOwnProfile = false }: ProfileHeaderProps) {
  if (!user) {
    return (
      <div className="flex flex-col items-center space-y-4 py-12">
        <div className="animate-pulse">
          <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  const getUserInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase()
  }


  // Пока у всех уровень 1, в будущем можно добавить логику расчета
  const userLevel = 1

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="flex flex-col items-center space-y-6 py-12">
        {/* Аватар */}
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage
              src={user.avatar?.url}
              alt={user.username}
            />
            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getUserInitials(user.username)}
            </AvatarFallback>
          </Avatar>

          {/* Уровень */}
          <div className="absolute -bottom-2 -right-2">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1 shadow-md"
            >
              LVL {userLevel}
            </Badge>
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            @{user.username}
          </h1>


        </div>
      </CardContent>
    </Card>
  )
}