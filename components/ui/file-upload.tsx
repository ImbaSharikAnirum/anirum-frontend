"use client"

import React from 'react'
import {
  AlertCircleIcon,
  FileArchiveIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  Trash2Icon,
  UploadIcon,
  VideoIcon,
  XIcon,
  GripVerticalIcon,
} from "lucide-react"

import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// No initial files by default
const initialFiles: any[] = []

const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  const iconMap = {
    pdf: {
      icon: FileTextIcon,
      conditions: (type: string, name: string) =>
        type.includes("pdf") ||
        name.endsWith(".pdf") ||
        type.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx"),
    },
    archive: {
      icon: FileArchiveIcon,
      conditions: (type: string, name: string) =>
        type.includes("zip") ||
        type.includes("archive") ||
        name.endsWith(".zip") ||
        name.endsWith(".rar"),
    },
    excel: {
      icon: FileSpreadsheetIcon,
      conditions: (type: string, name: string) =>
        type.includes("excel") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx"),
    },
    video: {
      icon: VideoIcon,
      conditions: (type: string) => type.includes("video/"),
    },
    audio: {
      icon: HeadphonesIcon,
      conditions: (type: string) => type.includes("audio/"),
    },
    image: {
      icon: ImageIcon,
      conditions: (type: string) => type.startsWith("image/"),
    },
  }

  for (const { icon: Icon, conditions } of Object.values(iconMap)) {
    if (conditions(fileType, fileName)) {
      return <Icon className="size-5 opacity-60" />
    }
  }

  return <FileIcon className="size-5 opacity-60" />
}

function SortableFileItem({ file, index, onRemove }: { 
  file: any, 
  index: number, 
  onRemove: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-background relative flex flex-col rounded-md border cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {getFilePreview(file)}
      
      {/* Drag indicator - теперь только для визуальной подсказки */}
      <div className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white opacity-70 pointer-events-none">
        <GripVerticalIcon className="size-3" />
      </div>
      
      {/* Remove Button */}
      <Button
        onClick={onRemove}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        size="icon"
        className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none z-10"
        aria-label="Remove image"
      >
        <XIcon className="size-3.5" />
      </Button>
      
      <div className="flex min-w-0 flex-col gap-0.5 border-t p-3">
        <p className="truncate text-[13px] font-medium">
          {file.file.name}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {formatBytes(file.file.size)}
        </p>
      </div>
    </div>
  )
}

const getFilePreview = (file: {
  file: File | { type: string; name: string; url?: string }
}) => {
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const fileName = file.file instanceof File ? file.file.name : file.file.name

  const renderImage = (src: string) => (
    <img
      src={src}
      alt={fileName}
      className="size-full rounded-t-[inherit] object-cover"
    />
  )

  return (
    <div className="bg-accent flex aspect-square items-center justify-center overflow-hidden rounded-t-[inherit]">
      {fileType.startsWith("image/") ? (
        file.file instanceof File ? (
          (() => {
            const previewUrl = URL.createObjectURL(file.file)
            return renderImage(previewUrl)
          })()
        ) : file.file.url ? (
          renderImage(file.file.url)
        ) : (
          <ImageIcon className="size-5 opacity-60" />
        )
      ) : (
        getFileIcon(file)
      )}
    </div>
  )
}

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
  minFiles?: number
  maxSizeMB?: number
  uploadedGuides?: number[]
  onGuideDrop?: (guideNum: number) => void
}

export function FileUpload({
  onFilesChange,
  maxFiles = 10,
  minFiles = 5,
  maxSizeMB = 5,
  uploadedGuides = [],
  onGuideDrop
}: FileUploadProps) {
  const maxSize = maxSizeMB * 1024 * 1024

  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [isDraggingGuide, setIsDraggingGuide] = React.useState(false)

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      reorderFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    minFiles,
    initialFiles,
  })

  // Отдельный useEffect для обработки изменений файлов
  React.useEffect(() => {
    const actualFiles = files
      .map(f => f.file)
      .filter((file): file is File => file instanceof File)
    onFilesChange?.(actualFiles)
  }, [files, onFilesChange])

  // Обработка перетаскивания гайдов
  const handleGuideDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    const guideNumber = e.dataTransfer.types.includes('guide-number')
    if (guideNumber) {
      setIsDraggingGuide(true)
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleGuideDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setIsDraggingGuide(false)
    }
  }

  const handleGuideDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingGuide(false)

    const guideNumber = e.dataTransfer.getData('guide-number')
    if (guideNumber && onGuideDrop) {
      onGuideDrop(parseInt(guideNumber))
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = files.findIndex((file) => file.id === active.id)
      const newIndex = files.findIndex((file) => file.id === over?.id)
      
      reorderFiles(oldIndex, newIndex)
    }
    
    setActiveId(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={(e) => {
          handleDragEnter(e)
          if (e.dataTransfer.types.includes('guide-number')) {
            setIsDraggingGuide(true)
          }
        }}
        onDragLeave={(e) => {
          handleDragLeave(e)
          handleGuideDragLeave(e)
        }}
        onDragOver={(e) => {
          handleDragOver(e)
          handleGuideDragOver(e)
        }}
        onDrop={(e) => {
          // Проверяем, это гайд или обычный файл
          if (e.dataTransfer.types.includes('guide-number')) {
            handleGuideDrop(e)
          } else {
            handleDrop(e)
          }
        }}
        data-dragging={isDragging || isDraggingGuide || undefined}
        data-files={files.length > 0 || uploadedGuides.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 data-[dragging=true]:border-primary has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex h-60 flex-col items-center overflow-hidden rounded-xl border border-dashed p-3 transition-all not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        {files.length > 0 ? (
          <div className="flex w-full flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-sm font-medium">
                Files ({files.length}/{maxFiles})
              </h3>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={openFileDialog}>
                  <UploadIcon
                    className="-ms-0.5 size-3.5 opacity-60"
                    aria-hidden="true"
                  />
                  Add files
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearFiles}>
                  <Trash2Icon
                    className="-ms-0.5 size-3.5 opacity-60"
                    aria-hidden="true"
                  />
                  Remove all
                </Button>
              </div>
            </div>

            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={files.map(f => f.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {files.map((file, index) => (
                    <SortableFileItem
                      key={file.id}
                      file={file}
                      index={index}
                      onRemove={() => removeFile(file.id)}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeId ? (
                  <div className="bg-background relative flex flex-col rounded-md border opacity-90 transform rotate-6">
                    {(() => {
                      const activeFile = files.find(f => f.id === activeId)
                      return activeFile ? getFilePreview(activeFile) : null
                    })()}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
              aria-hidden="true"
            >
              <ImageIcon className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 text-sm font-medium">Drop your files here</p>
            <p className="text-muted-foreground text-xs">
              Min {minFiles} files ∙ Max {maxFiles} files ∙ Up to {maxSizeMB}MB
            </p>
            <Button type="button" variant="outline" className="mt-4" onClick={openFileDialog}>
              <UploadIcon className="-ms-1 opacity-60" aria-hidden="true" />
              Select images
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

    </div>
  )
}
