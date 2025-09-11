"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useUser } from "@/entities/user"
import { useRole } from "@/shared/hooks"
import { AuthButtons } from "./AuthButtons"
import { UserMenu } from "./UserMenu"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  const { user, clearAuth } = useUser()
  const { isStaff, role, roleName, isAuthenticated } = useRole()
  
  // Безопасно получаем sidebar состояние только если есть провайдер
  let open = false
  try {
    const sidebar = useSidebar()
    open = sidebar.open
  } catch (error) {
    // Если нет SidebarProvider, используем значение по умолчанию
    open = false
  }

  const handleLogout = () => {
    clearAuth()
  }
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* SidebarTrigger показываем только для авторизованных пользователей:
            - Staff: всегда
            - Остальные: только когда сайдбар может быть виден (когда навигация в header скрыта) */}
        {isAuthenticated && (
          <div className={`mr-4 ${isStaff ? 'flex' : `hidden ${open ? 'md:flex lg:hidden' : 'sm:flex md:hidden'}`}`}>
            <SidebarTrigger />
          </div>
        )}
        
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.svg" 
                alt="Anirum" 
                width={80} 
                height={32}
                className="w-20 h-8"
                priority
              />
            </Link>
            
            <nav className={`hidden items-center gap-2 ${open ? 'lg:flex' : 'md:flex'}`}>
              <Button variant="ghost" asChild>
                <Link href="/courses">Курсы</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/skills">Древо навыков</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/guides">Гайды</Link>
              </Button>
            </nav>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {user ? (
              <UserMenu user={user} onLogout={handleLogout} />
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}