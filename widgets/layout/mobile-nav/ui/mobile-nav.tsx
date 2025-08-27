"use client";

import {
  Home,
  BookOpen,
  BarChart3,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { name: "Главная", href: "/", icon: Home },
  { name: "Курсы", href: "/courses", icon: BookOpen },
  { name: "Навыки", href: "/skills", icon: BarChart3 },
  { name: "Гайды", href: "/guides", icon: FileText },
  { name: "Еще", href: "/more", icon: MoreHorizontal },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[60px] transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
