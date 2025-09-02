"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Header() {
  const { open } = useSidebar()
  
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <SidebarTrigger />
        </div>
        
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-semibold hover:text-gray-600 transition-colors">
              Anirum
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
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Вход</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Регистрация</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}