/**
 * Табы профиля с разделами контента
 * @layer widgets/profile-tabs
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Briefcase,
  Camera,
  GitBranch,
  Trophy,
  FileText
} from "lucide-react"
import { type User } from "@/entities/user"

interface ProfileTabsProps {
  user: User | null
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="guides" className="w-full">
      <div className="flex justify-center mb-6">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="guides" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Гайды</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Портфолио</span>
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center space-x-2">
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">Фото</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Навыки</span>
          </TabsTrigger>
          <TabsTrigger value="awards" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Награды</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="guides" className="w-full">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2 mb-2">
              <BookOpen className="w-6 h-6" />
              <span>Гайды и обучающие материалы</span>
            </h2>
            <p className="text-gray-600">
              Полезные руководства и инструкции
            </p>
          </div>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <FileText className="w-16 h-16 mx-auto text-gray-300" />
              <div className="space-y-1">
                <p className="text-xl font-medium text-gray-500">Гайды пока не добавлены</p>
                <p className="text-gray-400">Здесь будут отображаться обучающие материалы</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="portfolio" className="w-full">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2 mb-2">
              <Briefcase className="w-6 h-6" />
              <span>Портфолио</span>
            </h2>
            <p className="text-gray-600">
              Работы и проекты
            </p>
          </div>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Briefcase className="w-16 h-16 mx-auto text-gray-300" />
              <div className="space-y-1">
                <p className="text-xl font-medium text-gray-500">Портфолио пока пусто</p>
                <p className="text-gray-400">Здесь будут отображаться работы и проекты</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="photos" className="w-full">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2 mb-2">
              <Camera className="w-6 h-6" />
              <span>Фотогалерея</span>
            </h2>
            <p className="text-gray-600">
              Фотографии и изображения
            </p>
          </div>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Camera className="w-16 h-16 mx-auto text-gray-300" />
              <div className="space-y-1">
                <p className="text-xl font-medium text-gray-500">Фотографии не добавлены</p>
                <p className="text-gray-400">Здесь будут отображаться фото и изображения</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="skills" className="w-full">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2 mb-2">
              <GitBranch className="w-6 h-6" />
              <span>Древо навыков</span>
            </h2>
            <p className="text-gray-600">
              Навыки и компетенции
            </p>
          </div>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <GitBranch className="w-16 h-16 mx-auto text-gray-300" />
              <div className="space-y-1">
                <p className="text-xl font-medium text-gray-500">Навыки не указаны</p>
                <p className="text-gray-400">Здесь будет отображаться древо навыков и компетенций</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="awards" className="w-full">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2 mb-2">
              <Trophy className="w-6 h-6" />
              <span>Награды и достижения</span>
            </h2>
            <p className="text-gray-600">
              Награды и сертификаты
            </p>
          </div>
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <Trophy className="w-16 h-16 mx-auto text-gray-300" />
              <div className="space-y-1">
                <p className="text-xl font-medium text-gray-500">Награды не получены</p>
                <p className="text-gray-400">Здесь будут отображаться достижения и сертификаты</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}