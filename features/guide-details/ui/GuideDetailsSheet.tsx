'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react'
import Image from 'next/image'

interface GuideDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guide: {
    id: string
    title: string
    guideId: string
    thumbnail?: string
    status?: 'not_started' | 'in_progress' | 'completed'
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  } | null
}

const statusConfig = {
  not_started: { icon: Circle, label: 'Не начат', color: 'text-gray-500' },
  in_progress: { icon: Clock, label: 'В процессе', color: 'text-blue-500' },
  completed: { icon: CheckCircle2, label: 'Завершен', color: 'text-green-500' }
}

const difficultyConfig = {
  beginner: { label: 'Новичок', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Средний', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Продвинутый', color: 'bg-red-100 text-red-700' }
}

export function GuideDetailsSheet({ open, onOpenChange, guide }: GuideDetailsSheetProps) {
  if (!guide) return null

  const status = guide.status || 'not_started'
  const difficulty = guide.difficulty || 'beginner'
  const StatusIcon = statusConfig[status].icon

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <StatusIcon className={statusConfig[status].color} />
            <SheetTitle className="text-2xl">{guide.title}</SheetTitle>
          </div>
          <SheetDescription>
            Подробная информация о гайде
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Превью */}
          {guide.thumbnail && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <Image
                src={guide.thumbnail}
                alt={guide.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Метаданные */}
          <div className="flex gap-2">
            <Badge className={difficultyConfig[difficulty].color}>
              {difficultyConfig[difficulty].label}
            </Badge>
            <Badge variant="outline" className={statusConfig[status].color}>
              {statusConfig[status].label}
            </Badge>
          </div>

          {/* Описание */}
          <div>
            <h3 className="font-semibold mb-2">О гайде</h3>
            <p className="text-sm text-muted-foreground">
              {guide.title} - подробный гайд с пошаговыми инструкциями, примерами и практическими заданиями.
              Идеально подходит для уровня "{difficultyConfig[difficulty].label}".
            </p>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border bg-muted/50 text-center">
              <div className="text-xl font-bold">~2ч</div>
              <div className="text-xs text-muted-foreground">Длительность</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/50 text-center">
              <div className="text-xl font-bold">15</div>
              <div className="text-xs text-muted-foreground">Уроков</div>
            </div>
            <div className="p-3 rounded-lg border bg-muted/50 text-center">
              <div className="text-xl font-bold">5</div>
              <div className="text-xs text-muted-foreground">Заданий</div>
            </div>
          </div>

          {/* Действия */}
          <div className="space-y-2">
            <Button className="w-full gap-2">
              <BookOpen className="h-4 w-4" />
              {status === 'completed' ? 'Повторить гайд' : status === 'in_progress' ? 'Продолжить' : 'Начать изучение'}
            </Button>
            {status === 'in_progress' && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-blue-700">Прогресс</span>
                  <span className="text-blue-700 font-semibold">60%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
