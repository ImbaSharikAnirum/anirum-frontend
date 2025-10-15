'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateBranchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { label: string; thumbnail?: File }) => void
  type?: 'skill' | 'tree' // Тип создаваемого элемента
}

export function CreateBranchDialog({ open, onOpenChange, onSubmit, type = 'skill' }: CreateBranchDialogProps) {
  const [label, setLabel] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isTree = type === 'tree'
  const title = isTree ? 'Создать дерево навыков' : 'Создать навык'
  const labelPlaceholder = isTree ? 'Например: Веб-разработка' : 'Например: 3D Моделирование'
  const labelText = isTree ? 'Название дерева' : 'Название навыка'
  const iconText = isTree ? 'Иконка дерева (опционально)' : 'Иконка (опционально)'

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleRemoveImage = () => {
    setThumbnail(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = () => {
    if (label.trim()) {
      onSubmit({ label: label.trim(), thumbnail: thumbnail || undefined })
      setLabel('')
      setThumbnail(null)
      setPreviewUrl(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="branch-name">{labelText}</Label>
            <Input
              id="branch-name"
              placeholder={labelPlaceholder}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !thumbnail && handleSubmit()}
            />
          </div>

          {/* Загрузка изображения */}
          <div className="space-y-2">
            <Label>{iconText}</Label>

            {previewUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 border-2 border-border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "w-full h-40 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/50 hover:bg-muted"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-10 w-10" />
                  <div className="text-center text-sm">
                    <p className="font-medium">Нажмите или перетащите изображение</p>
                    <p className="text-xs">PNG, JPG до 5MB</p>
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
