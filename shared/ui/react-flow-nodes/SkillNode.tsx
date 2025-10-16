'use client'

import { memo, useRef, useEffect, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface SkillNodeData {
  label: string
  color?: string
  thumbnail?: string
  completed?: boolean
  guideCount?: number
  mode?: 'view' | 'edit'
  [key: string]: unknown
}

export const SkillNode = memo(({ data, selected }: NodeProps) => {
  const { label, color = '#3b82f6', thumbnail, completed = false, guideCount = 0, mode = 'view' } = data as SkillNodeData

  const labelRef = useRef<HTMLParagraphElement>(null)
  const [labelLines, setLabelLines] = useState(1)

  // Определяем количество строк текста названия
  useEffect(() => {
    if (labelRef.current) {
      const lineHeight = parseFloat(getComputedStyle(labelRef.current).lineHeight)
      const height = labelRef.current.offsetHeight
      const lines = Math.round(height / lineHeight)
      setLabelLines(lines)
    }
  }, [label])

  // Динамическая высота контейнера (базовая + дополнительно для счётчика гайдов)
  const containerHeight = 195 + 16 // +16px для строки с количеством гайдов

  return (
    <div
      className={cn(
        'relative transition-all duration-300 cursor-pointer flex flex-col items-center',
        'hover:scale-105',
        selected && 'scale-110'
      )}
      style={{ width: '160px', height: `${containerHeight}px` }}
    >
      <div
        className={cn(
          'rounded-full border-4 transition-all duration-300 overflow-hidden relative',
          selected ? 'ring-4 ring-offset-4 shadow-2xl' : 'shadow-lg',
          completed ? 'border-orange-500' : 'border-gray-400'
        )}
        style={{
          width: '160px',
          height: '160px',
          flexShrink: 0,
          ...(selected ? { '--tw-ring-color': completed ? '#f97316' : '#9ca3af' } as any : {}),
        }}
      >
        {/* Фоновое изображение */}
        {thumbnail ? (
          <>
            <Image
              src={thumbnail}
              alt={label}
              fill
              className={cn(
                'object-cover transition-all duration-500',
                // В режиме редактирования всегда цветная
                mode === 'edit' && 'grayscale-0',
                // В режиме просмотра зависит от completed
                mode === 'view' && (completed ? 'grayscale-0' : 'grayscale')
              )}
            />
            {/* Затемнение для читаемости текста - убираем если выполнено или в режиме редактирования */}
            {!(completed || mode === 'edit') && (
              <div className="absolute inset-0 bg-black/40" />
            )}
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: `${color}10` }} />
        )}
      </div>

      {/* Текст под кругом */}
      <div className="w-full mt-2 px-1">
        <p ref={labelRef} className="text-sm font-semibold text-center leading-tight line-clamp-2">
          {label}
        </p>
        {/* Количество гайдов */}
        <p className="text-xs text-muted-foreground text-center mt-1">
          {guideCount} {guideCount === 1 ? 'гайд' : guideCount >= 2 && guideCount <= 4 ? 'гайда' : 'гайдов'}
        </p>
      </div>

      {/* Handles для связей - нижний handle ниже при 2 строках названия */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn("z-50", mode === 'edit' ? 'w-4 h-4' : 'w-1 h-1 opacity-0')}
        style={{ top: mode === 'edit' ? -6 : 0, backgroundColor: completed ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("z-50", mode === 'edit' ? 'w-4 h-4' : 'w-1 h-1 opacity-0')}
        style={{
          bottom: labelLines === 2 ? (mode === 'edit' ? -12 : -8) : (mode === 'edit' ? -6 : 0),
          backgroundColor: completed ? '#f97316' : '#9ca3af'
        }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={cn("z-50", mode === 'edit' ? 'w-4 h-4' : 'w-1 h-1 opacity-0')}
        style={{ left: mode === 'edit' ? -6 : 0, top: '80px', backgroundColor: completed ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn("z-50", mode === 'edit' ? 'w-4 h-4' : 'w-1 h-1 opacity-0')}
        style={{ right: mode === 'edit' ? -6 : 0, top: '80px', backgroundColor: completed ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
    </div>
  )
})

SkillNode.displayName = 'SkillNode'
