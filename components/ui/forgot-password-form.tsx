import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Забыли пароль?</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Введите ваш email и мы отправим ссылку для восстановления пароля
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com" 
            required 
            autoComplete="email" 
          />
        </div>
        <Button type="submit" className="w-full whitespace-normal leading-tight py-3 h-auto">
          Отправить ссылку для восстановления
        </Button>
      </div>
      <div className="text-center text-sm">
        <a href="/auth/login" className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          Вернуться к входу
        </a>
      </div>
    </form>
  )
}