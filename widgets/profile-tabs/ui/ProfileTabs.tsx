/**
 * Табы профиля с разделами контента
 * @layer widgets/profile-tabs
 */

'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Image } from "lucide-react"
import { type User } from "@/entities/user"
import { ProfileGuides } from "@/widgets/profile-guides"
import { ProfileCreations } from "@/widgets/profile-creations"

interface ProfileTabsProps {
  user: User | null
}

export function ProfileTabs({ user }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="creations" className="w-full">
      <div className="flex justify-center mb-6">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="creations" className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span className="hidden sm:inline">Креативы</span>
          </TabsTrigger>
          <TabsTrigger value="guides" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Гайды</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="creations" className="w-full">
        <ProfileCreations user={user} />
      </TabsContent>

      <TabsContent value="guides" className="w-full">
        <ProfileGuides user={user} />
      </TabsContent>
    </Tabs>
  )
}