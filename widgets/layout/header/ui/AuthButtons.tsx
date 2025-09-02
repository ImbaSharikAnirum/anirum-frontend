/**
 * Кнопки авторизации для неавторизованных пользователей
 * @layer widgets/layout
 */

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AuthButtons() {
  return (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/login">Вход</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">Регистрация</Link>
      </Button>
    </>
  )
}