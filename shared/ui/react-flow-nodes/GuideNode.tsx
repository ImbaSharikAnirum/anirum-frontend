'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface GuideNodeData {
  title: string
  guideId: string
  thumbnail?: string
  status?: 'not_started' | 'in_progress' | 'completed'
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  mode?: 'view' | 'edit'
  [key: string]: unknown
}

const statusConfig = {
  not_started: {
    icon: Circle,
    color: 'text-white',
    bg: 'bg-gray-50',
    border: 'border-gray-400'
  },
  in_progress: {
    icon: Clock,
    color: 'text-white',
    bg: 'bg-blue-50',
    border: 'border-gray-400'
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-white',
    bg: 'bg-green-50',
    border: 'border-orange-500'
  }
}

const difficultyConfig = {
  beginner: { label: 'Новичок', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Средний', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: 'Продвинутый', color: 'bg-red-100 text-red-700' }
}

export const GuideNode = memo(({ data, selected }: NodeProps) => {
  const { title, thumbnail, status = 'not_started', difficulty, mode = 'view' } = data as GuideNodeData
  const statusStyle = statusConfig[status]
  const StatusIcon = statusStyle.icon

  return (
    <div
      className={cn(
        'relative transition-all duration-300 cursor-pointer',
        'hover:scale-105',
        selected && 'scale-110'
      )}
      style={{ width: '120px', height: '120px' }}
    >
      <div
        className={cn(
          'rounded-full border-3 transition-all duration-300 absolute inset-0 overflow-hidden',
          statusStyle.border,
          selected ? 'ring-4 ring-offset-3 shadow-xl' : 'shadow-md'
        )}
        style={{
          ...(selected ? { '--tw-ring-color': status === 'completed' ? '#f97316' : '#9ca3af' } as any : {}),
        }}
      >
        {/* Фоновое изображение */}
        {thumbnail ? (
          <>
            <Image
              src={thumbnail}
              alt={title}
              fill
              className={cn(
                'object-cover transition-all duration-500',
                // В режиме редактирования всегда цветная
                mode === 'edit' && 'grayscale-0',
                // В режиме просмотра зависит от статуса
                mode === 'view' && status === 'not_started' && 'grayscale',
                mode === 'view' && status === 'in_progress' && 'grayscale-[50%]',
                mode === 'view' && status === 'completed' && 'grayscale-0'
              )}
            />
            {/* Затемнение для читаемости - убираем если выполнено или в режиме редактирования */}
            {!(status === 'completed' || mode === 'edit') && (
              <div className="absolute inset-0 bg-black/50" />
            )}
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: statusStyle.bg }} />
        )}

        {/* Контент */}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-3 gap-1">
          <h4
            className={cn(
              "font-medium text-xs text-center leading-tight line-clamp-2",
              thumbnail ? "text-white drop-shadow-lg" : ""
            )}
          >
            {title}
          </h4>

          {/* Сложность */}
          {difficulty && !thumbnail && (
            <div className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full', difficultyConfig[difficulty].color)}>
              {difficultyConfig[difficulty].label}
            </div>
          )}
        </div>
      </div>

      {/* Handles для связей - всегда рендерим (иначе связи не работают), но скрываем в режиме просмотра */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{ top: mode === 'edit' ? -4 : 0, backgroundColor: status === 'completed' ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{ bottom: mode === 'edit' ? -4 : 0, backgroundColor: status === 'completed' ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{ left: mode === 'edit' ? -4 : 0, backgroundColor: status === 'completed' ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{ right: mode === 'edit' ? -4 : 0, backgroundColor: status === 'completed' ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
    </div>
  )
})

GuideNode.displayName = 'GuideNode'
