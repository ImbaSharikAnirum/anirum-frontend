import Link from 'next/link'

export function Footer() {
  return (
    <footer className="hidden md:block border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <p className="text-sm text-muted-foreground">
              © 2024 Anirum Platform.
            </p>
          </div>
          
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Конфиденциальность
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Условия
            </Link>
            <Link href="/company" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Реквизиты компании
            </Link>
            <Link href="/apply-teacher" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Стать преподавателем
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}