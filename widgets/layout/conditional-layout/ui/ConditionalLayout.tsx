/**
 * Условный layout в зависимости от роли пользователя
 * @layer widgets/layout
 */

'use client'

import { ReactNode } from 'react'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/widgets/layout/header"
import { AppSidebar } from "@/widgets/layout/sidebar"
import { Footer } from "@/widgets/layout/footer"
import { MobileNav } from "@/widgets/layout/mobile-nav"
import { useRole } from "@/shared/hooks"

interface ConditionalLayoutProps {
  children: ReactNode
  defaultOpen?: boolean
}

export function ConditionalLayout({ children, defaultOpen = true }: ConditionalLayoutProps) {
  const { isStaff } = useRole()


  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* Сайдбар всегда рендерим, но показываем:
          - Staff: всегда
          - Остальные: только когда навигация в header скрыта и нет MobileNav */}
      <AppSidebar />
      
      <SidebarInset>
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </SidebarInset>
      
     <MobileNav />
    </SidebarProvider>
  )
}