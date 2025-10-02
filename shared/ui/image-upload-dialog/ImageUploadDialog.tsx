'use client'

/**
 * Диалог загрузки изображения с drag-and-drop
 * @layer shared/ui
 */

import { AlertCircleIcon, ImageUpIcon, XIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useFileUpload } from '@/hooks/use-file-upload'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
  pinTitle?: string
}

export function ImageUploadDialog({
  open,
  onOpenChange,
  onUpload,
  isUploading,
  pinTitle,
}: ImageUploadDialogProps) {
  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: 'image/*',
    maxSize,
  })

  const previewUrl = files[0]?.preview || null

  const handleUploadClick = async () => {
    if (!files[0]?.file || !(files[0].file instanceof File)) return

    try {
      await onUpload(files[0].file)
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Загрузить свое изображение</DialogTitle>
          {pinTitle && (
            <p className="text-sm text-gray-600 mt-1">По мотивам: {pinTitle}</p>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          {/* Drag & Drop область */}
          <div className="relative">
            <div
              role="button"
              onClick={openFileDialog}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              data-dragging={isDragging || undefined}
              className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px] cursor-pointer"
            >
              <input
                {...getInputProps()}
                className="sr-only"
                aria-label="Загрузить файл"
              />
              {previewUrl ? (
                <div className="absolute inset-0">
                  <img
                    src={previewUrl}
                    alt={
                      files[0]?.file instanceof File
                        ? files[0].file.name
                        : 'Загруженное изображение'
                    }
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                  <div
                    className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                    aria-hidden="true"
                  >
                    <ImageUpIcon className="size-4 opacity-60" />
                  </div>
                  <p className="mb-1.5 text-sm font-medium">
                    Перетащите изображение сюда или нажмите для выбора
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Максимальный размер: {maxSizeMB}МБ
                  </p>
                </div>
              )}
            </div>
            {previewUrl && (
              <div className="absolute top-4 right-4 z-10">
                <button
                  type="button"
                  className="focus-visible:border-ring focus-visible:ring-ring/50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:ring-[3px]"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(files[0]?.id)
                  }}
                  aria-label="Удалить изображение"
                >
                  <XIcon className="size-4" aria-hidden="true" />
                </button>
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

          <Button
            onClick={handleUploadClick}
            disabled={!previewUrl || isUploading}
            className="w-full"
          >
            {isUploading ? 'Загрузка...' : 'Загрузить'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
