"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useUser } from "@/entities/user"
import { useRole } from "@/shared/lib/hooks/useRole"
import { AuthButtons } from "./AuthButtons"
import { UserMenu } from "./UserMenu"
import Link from "next/link"
import Image from "next/image"

export function Header() {
  const { open } = useSidebar()
  const { user, isAuthenticated, clearAuth } = useUser()
  const { isStaff } = useRole()

  const handleLogout = () => {
    clearAuth()
  }
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {isStaff && (
          <div className="mr-4 flex">
            <SidebarTrigger />
          </div>
        )}
        
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.svg" 
                alt="Anirum" 
                width={32} 
                height={32}
                className="w-20 h-8"
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
            {isAuthenticated && user ? (
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