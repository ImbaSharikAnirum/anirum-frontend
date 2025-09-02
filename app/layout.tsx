import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Header } from "@/widgets/layout/header"
import { AppSidebar } from "@/widgets/layout/sidebar"
import { Footer } from "@/widgets/layout/footer"
import { MobileNav } from "@/widgets/layout/mobile-nav"
import { UserProvider } from "@/entities/user"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anirum Platform',
  description: 'Custom platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        
        <UserProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </SidebarInset>
            <MobileNav />
          </SidebarProvider>
        </UserProvider>
      </body>
    </html>
  )
}
