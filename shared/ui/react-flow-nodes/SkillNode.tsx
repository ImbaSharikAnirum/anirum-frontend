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
  const containerHeight = 125 + 16 // +16px для строки с количеством гайдов

  return (
    <div
      className={cn(
        'relative transition-all duration-300 cursor-pointer flex flex-col items-center',
        'hover:scale-105',
        selected && 'scale-110'
      )}
      style={{ width: '100px', height: `${containerHeight}px` }}
    >
      <div
        className={cn(
          'rounded-full border-3 transition-all duration-300 overflow-hidden relative',
          selected ? 'ring-3 ring-offset-2 shadow-xl' : 'shadow-md',
          completed ? 'border-orange-500' : 'border-gray-400'
        )}
        style={{
          width: '100px',
          height: '100px',
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
              className="object-cover transition-all duration-500"
              // Закомментировано: фильтр черно-белого при невыполненном навыке
              // className={cn(
              //   'object-cover transition-all duration-500',
              //   // В режиме редактирования всегда цветная
              //   mode === 'edit' && 'grayscale-0',
              //   // В режиме просмотра зависит от completed
              //   mode === 'view' && (completed ? 'grayscale-0' : 'grayscale')
              // )}
            />
            {/* Закомментировано: затемнение для читаемости текста */}
            {/* {!(completed || mode === 'edit') && (
              <div className="absolute inset-0 bg-black/40" />
            )} */}
          </>
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: `${color}10` }} />
        )}
      </div>

      {/* Текст под кругом */}
      <div className="w-full mt-1.5 px-1">
        <p ref={labelRef} className="text-xs font-semibold text-center leading-tight line-clamp-2">
          {label}
        </p>
        {/* Количество гайдов */}
        <p className="text-[10px] text-muted-foreground text-center mt-0.5">
          {guideCount} {guideCount === 1 ? 'гайд' : guideCount >= 2 && guideCount <= 4 ? 'гайда' : 'гайдов'}
        </p>
      </div>

      {/* Handles для связей - нижний handle ниже при 2 строках названия */}
      <Handle
        type="target"
        position={Position.Top}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{ top: mode === 'edit' ? -4 : 0, backgroundColor: completed ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{
          bottom: labelLines === 2 ? (mode === 'edit' ? -18 : -14) : (mode === 'edit' ? -4 : 0),
          backgroundColor: completed ? '#f97316' : '#9ca3af'
        }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Left}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{ left: mode === 'edit' ? -4 : 0, top: '50px', backgroundColor: completed ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
      <Handle
        type="source"
        position={Position.Right}
        className={cn("z-50", mode === 'edit' ? 'w-3 h-3' : 'w-1 h-1 opacity-0')}
        style={{ right: mode === 'edit' ? -4 : 0, top: '50px', backgroundColor: completed ? '#f97316' : '#9ca3af' }}
        isConnectable={mode === 'edit'}
      />
    </div>
  )
})

SkillNode.displayName = 'SkillNode'
