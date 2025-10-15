"use client";

import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  BarChart3,
  Search,
  Settings,
  DollarSign,
  BookOpen,
  MessageSquare,
  CheckCircle,
  Plus,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { useRole } from "@/shared/hooks";
import { usePathname } from "next/navigation";
import { SidebarGuidesWidget } from "./SidebarGuidesWidget";
import { SidebarSkillTreesWidget } from "./SidebarSkillTreesWidget";
import { useSkills } from "@/shared/lib/contexts/SkillsContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { title: "Курсы", url: "/courses", icon: Home },
  { title: "Древо навыков", url: "/skills", icon: BarChart3 },
  { title: "Гайды", url: "/guides", icon: Search },
];

const managerItems = [
  { title: "Финансы", url: "/dashboard/manager/finance", icon: DollarSign },
  // { title: "Аналитика", url: "/dashboard/manager/analytics", icon: TrendingUp },
  { title: "Чат", url: "/dashboard/manager/chat", icon: MessageSquare },
  { title: "Команда", url: "/dashboard/manager/team", icon: Users },
  {
    title: "Курсы на проверку",
    url: "/dashboard/manager/courses",
    icon: CheckCircle,
  },
  { title: "Создать курс", url: "/courses/create", icon: Plus },
];

const teacherItems = [
  { title: "Финансы", url: "/dashboard/teacher/finance", icon: DollarSign },
  { title: "Мои курсы", url: "/dashboard/teacher/my-courses", icon: BookOpen },
  { title: "Создать курс", url: "/courses/create", icon: Plus },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { isManager, isTeacher, isStaff, isAuthenticated } = useRole();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { isSkillMode, isOwnTree } = useSkills();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isSkillsPage = isClient && pathname?.startsWith("/skills");

  return (
    <Sidebar
      className={`${
        !isStaff ? (open ? "md:flex lg:hidden" : "sm:flex md:hidden") : ""
      }`}
    >
      <SidebarContent>
        {/* Основная навигация - всем */}
        {isSkillsPage ? (
          <SidebarGroup className={`hidden mt-4 ${open ? "md:block lg:hidden" : "sm:block md:hidden"}`}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          <span>Навигация</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="start"
                      className="w-56"
                    >
                      {navigationItems.map((item) => (
                        <DropdownMenuItem key={item.title} asChild>
                          <a
                            href={item.url}
                            className="flex items-center gap-2"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup
            className={`hidden ${
              open ? "md:block lg:hidden" : "sm:block md:hidden"
            }`}
          >
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
        )}

        {/* Панель менеджера */}
        {isManager &&
          (isSkillsPage ? (
            <SidebarGroup className="mt-4">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span>Менеджер</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-56"
                      >
                        {managerItems.map((item) => (
                          <DropdownMenuItem key={item.title} asChild>
                            <a
                              href={item.url}
                              className="flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
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
          ))}

        {/* Панель преподавателя */}
        {isTeacher &&
          (isSkillsPage ? (
            <SidebarGroup className="mt-4">
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>Преподаватель</span>
                          </div>
                          <ChevronRight className="h-4 w-4" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="right"
                        align="start"
                        className="w-56"
                      >
                        {teacherItems.map((item) => (
                          <DropdownMenuItem key={item.title} asChild>
                            <a
                              href={item.url}
                              className="flex items-center gap-2"
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : (
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
          ))}
        {/* Виджеты для страницы skills */}
        {isSkillsPage && (
          <>
            {/* Гайды показываем только когда в навыке И пользователь - автор дерева */}
            {isSkillMode && isOwnTree && <SidebarGuidesWidget />}
            {/* Деревья навыков всегда показываем на странице skills */}
            <SidebarSkillTreesWidget />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
