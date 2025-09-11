import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { cookies } from 'next/headers'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/widgets/layout/header"
import { AppSidebar } from "@/widgets/layout/sidebar"
import { Footer } from "@/widgets/layout/footer"
import { MobileNav } from "@/widgets/layout/mobile-nav"
import { UserProvider } from "@/entities/user"
import { ConditionalLayout } from "@/widgets/layout/conditional-layout"
import { QueryProvider } from "@/shared/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"
import { getServerUser } from "@/shared/lib/auth"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://anirum.com'),
  title: 'Anirum',
  description: 'Изучайте анимацию и геймдев. Курсы от экспертов, практические гайды и секреты индустрии',
  openGraph: {
    title: 'Anirum - Платформа обучения анимации и геймдев',
    description: 'Изучайте анимацию и геймдев. Курсы от экспертов, практические гайды и секреты индустрии',
    url: 'https://anirum.com',
    siteName: 'Anirum',
    images: [
      {
        url: '/og-image.jpg', // Основное изображение 1200x630
        width: 1200,
        height: 630,
        alt: 'Anirum - Платформа обучения анимации и геймдев',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anirum - Платформа обучения анимации и геймдев',
    description: 'Изучайте анимацию и геймдев. Курсы от экспертов, практические гайды и секреты индустрии',
    images: ['/og-image.jpg'],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  
  // Получаем пользователя на сервере для SSR
  const initialUser = await getServerUser()
  
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${inter.className} antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MWMB2LNS89"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MWMB2LNS89');
          `}
        </Script>
        
        <QueryProvider>
          <UserProvider initialUser={initialUser}>
            <ConditionalLayout defaultOpen={defaultOpen}>
              {children}
            </ConditionalLayout>
          </UserProvider>
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
