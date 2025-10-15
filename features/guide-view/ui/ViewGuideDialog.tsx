'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Clock, Target } from 'lucide-react'

interface ViewGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guide: {
    title: string
    thumbnail?: string
    status?: 'not_started' | 'in_progress' | 'completed'
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    description?: string
    duration?: string
  } | null
}

const statusLabels = {
  not_started: 'Не начат',
  in_progress: 'В процессе',
  completed: 'Завершён',
}

const difficultyLabels = {
  beginner: 'Начальный',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

export function ViewGuideDialog({ open, onOpenChange, guide }: ViewGuideDialogProps) {
  if (!guide) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{guide.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Превью изображение */}
          {guide.thumbnail && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
              <img
                src={guide.thumbnail}
                alt={guide.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Метаинформация */}
          <div className="flex flex-wrap gap-3">
            {guide.difficulty && (
              <Badge variant="outline" className={difficultyColors[guide.difficulty]}>
                <Target className="h-3 w-3 mr-1" />
                {difficultyLabels[guide.difficulty]}
              </Badge>
            )}

            {guide.status && (
              <Badge variant="outline">
                <BookOpen className="h-3 w-3 mr-1" />
                {statusLabels[guide.status]}
              </Badge>
            )}

            {guide.duration && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {guide.duration}
              </Badge>
            )}
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Описание
            </h3>
            <p className="text-sm leading-relaxed">
              {guide.description || 'Описание гайда пока не добавлено.'}
            </p>
          </div>

          {/* TODO: Добавить секции с контентом гайда */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Содержание
            </h3>
            <div className="rounded-lg border p-4 text-center text-muted-foreground text-sm">
              Содержание гайда будет добавлено позже
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
