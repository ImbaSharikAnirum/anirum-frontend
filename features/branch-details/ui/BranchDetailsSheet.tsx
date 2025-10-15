'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'

interface BranchDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch: {
    id: string
    label: string
    color: string
    thumbnail?: string
  } | null
}

export function BranchDetailsSheet({ open, onOpenChange, branch }: BranchDetailsSheetProps) {
  if (!branch) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-2xl" style={{ color: branch.color }}>
            {branch.label}
          </SheetTitle>
          <SheetDescription>
            Информация об отрасли и связанных гайдах
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Превью */}
          {branch.thumbnail && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <Image
                src={branch.thumbnail}
                alt={branch.label}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Описание */}
          <div>
            <h3 className="font-semibold mb-2">Описание</h3>
            <p className="text-sm text-muted-foreground">
              Изучите все аспекты {branch.label.toLowerCase()}. Эта отрасль включает множество гайдов для изучения от базового до продвинутого уровня.
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="text-2xl font-bold" style={{ color: branch.color }}>12</div>
              <div className="text-xs text-muted-foreground">Гайдов</div>
            </div>
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="text-2xl font-bold" style={{ color: branch.color }}>~24ч</div>
              <div className="text-xs text-muted-foreground">Время изучения</div>
            </div>
          </div>

          {/* Действия */}
          <div className="space-y-2">
            <Button className="w-full" style={{ backgroundColor: branch.color }}>
              Начать обучение
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Открыть все гайды
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
