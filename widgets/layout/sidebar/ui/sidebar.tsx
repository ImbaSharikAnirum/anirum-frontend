"use client"

import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar"
import { Home, Users, BarChart3, Search, Settings, DollarSign, BookOpen, MessageSquare, CheckCircle, Plus } from "lucide-react"
import { useRole } from "@/shared/hooks"

const navigationItems = [
  { title: "Курсы", url: "/courses", icon: Home },
  { title: "Древо навыков", url: "/skills", icon: BarChart3 },
  { title: "Гайды", url: "/guides", icon: Search },
]

const managerItems = [
  { title: "Финансы", url: "/dashboard/manager/finance", icon: DollarSign },
  { title: "Чат", url: "/dashboard/manager/chat", icon: MessageSquare },
  { title: "Команда", url: "/dashboard/manager/team", icon: Users },
  { title: "Курсы на проверку", url: "/dashboard/manager/courses", icon: CheckCircle },
  { title: "Создать курс", url: "/courses/create", icon: Plus },
]

const teacherItems = [
  { title: "Финансы", url: "/dashboard/teacher/finance", icon: DollarSign },
  { title: "Мои курсы", url: "/dashboard/teacher/my-courses", icon: BookOpen },
  { title: "Создать курс", url: "/courses/create", icon: Plus },
]

export function AppSidebar() {
  const { open } = useSidebar()
  const { isManager, isTeacher, isStaff, isAuthenticated } = useRole()
  
  return (
    <Sidebar className={`${!isStaff ? (open ? 'md:flex lg:hidden' : 'sm:flex md:hidden') : ''}`}>
      <SidebarContent>
        {/* Основная навигация - всем */}
        <SidebarGroup className={`hidden ${open ? 'md:block lg:hidden' : 'sm:block md:hidden'}`}>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Панель менеджера */}
        {isManager && (
          <SidebarGroup>
          <SidebarGroupLabel>Менеджер</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
        
        {/* Панель преподавателя */}
        {isTeacher && (
          <SidebarGroup>
          <SidebarGroupLabel>Преподаватель</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teacherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}