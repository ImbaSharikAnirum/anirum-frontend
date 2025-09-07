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
import { useUser } from "@/entities/user"

interface ConditionalLayoutProps {
  children: ReactNode
  defaultOpen?: boolean
}

export function ConditionalLayout({ children, defaultOpen = true }: ConditionalLayoutProps) {
  const { isStaff } = useRole()
  const { isLoading, isAuthenticated } = useUser()

  // Не показываем сайдбар во время загрузки, чтобы избежать мерцания
  const shouldShowSidebar = !isLoading && isAuthenticated && isStaff

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* Условно показываем сайдбар только для staff */}
      {shouldShowSidebar && <AppSidebar />}
      
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