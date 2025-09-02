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
import { useRole } from "@/shared/lib/hooks/useRole"

interface ConditionalLayoutProps {
  children: ReactNode
  defaultOpen?: boolean
}

export function ConditionalLayout({ children, defaultOpen = true }: ConditionalLayoutProps) {
  const { isStaff } = useRole()

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* Условно показываем сайдбар только для staff */}
      {isStaff && <AppSidebar />}
      
      <SidebarInset>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </SidebarInset>
      
      {/* Мобильную навигацию тоже показываем только для staff */}
      {isStaff && <MobileNav />}
    </SidebarProvider>
  )
}