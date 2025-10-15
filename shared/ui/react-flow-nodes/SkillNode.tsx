'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface SkillNodeData {
  label: string
  color?: string
  thumbnail?: string
  completed?: boolean
  mode?: 'view' | 'edit'
  [key: string]: unknown
}

export const SkillNode = memo(({ data, selected }: NodeProps) => {
  const { label, color = '#3b82f6', thumbnail, completed = false, mode = 'view' } = data as SkillNodeData

  return (
    <div
      className={cn(
        'relative transition-all duration-300 cursor-pointer flex flex-col items-center',
        'hover:scale-105',
        selected && 'scale-110'
      )}
      style={{ width: '160px', height: '195px' }}
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
        <p className="text-sm font-semibold text-center leading-tight line-clamp-2">
          {label}
        </p>
      </div>

      {/* Handles для связей - привязаны к основному контейнеру */}
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
        style={{ bottom: mode === 'edit' ? -6 : 0, backgroundColor: completed ? '#f97316' : '#9ca3af' }}
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
