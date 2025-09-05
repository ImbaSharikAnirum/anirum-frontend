'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function BookingHeader() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="mb-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Подтвердите и оплатите</h1>
      </div>
    </div>
  )
}