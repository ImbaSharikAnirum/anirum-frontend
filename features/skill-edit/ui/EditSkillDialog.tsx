'use client'

import { useState, useRef, useEffect, ChangeEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { skillTreeAPI } from '@/entities/skill-tree'
import { toast } from 'sonner'

interface EditSkillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: {
    id: string
    title: string
    thumbnail?: string
    imageId?: number
  } | null
  onSave: (data: { title: string; image?: string; imageId?: number }) => void
}

export function EditSkillDialog({ open, onOpenChange, skill, onSave }: EditSkillDialogProps) {
  const [title, setTitle] = useState(skill?.title || '')
  const [image, setImage] = useState<string | undefined>(skill?.thumbnail)
  const [imageId, setImageId] = useState<number | undefined>(skill?.imageId)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Обновляем состояние при смене навыка
  useEffect(() => {
    if (skill) {
      setTitle(skill.title)
      setImage(skill.thumbnail)
      setImageId(skill.imageId)
    }
  }, [skill])

  // Обработка выбора файла - загружаем сразу на сервер
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB')
      return
    }

    setIsUploading(true)
    setIsLoading(true)

    // Сохраняем старый imageId для удаления после успешной загрузки нового
    const oldImageId = imageId

    try {
      // Загружаем изображение сразу на S3 через существующий метод API
      const uploadedIds = await skillTreeAPI.uploadImage(file)
      const newImageId = uploadedIds[0]

      // Получаем URL для preview
      const response = await fetch(`/api/upload/files/${newImageId}`)
      if (!response.ok) {
        throw new Error('Не удалось получить данные изображения')
      }

      const imageData = await response.json()
      const imageUrl = imageData.url

      // Сохраняем URL (для отображения) и ID (для публикации)
      setImage(imageUrl)
      setImageId(newImageId)

      console.log('✅ Изображение загружено:', { id: newImageId, url: imageUrl })
      toast.success('Изображение успешно загружено')

      // Удаляем старое изображение (если было)
      if (oldImageId) {
        try {
          await skillTreeAPI.deleteImage(oldImageId)
          console.log('🗑️ Старое изображение удалено:', oldImageId)
        } catch (deleteError) {
          // Не показываем ошибку пользователю, т.к. это не критично
          console.warn('Не удалось удалить старое изображение:', deleteError)
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке изображения:', error)
      const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить изображение'
      toast.error(errorMessage)
    } finally {
      setIsUploading(false)
      setIsLoading(false)
    }
  }

  // Удаление изображения
  const handleRemoveImage = async () => {
    const currentImageId = imageId

    // Сначала очищаем UI
    setImage(undefined)
    setImageId(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    // Удаляем изображение из S3 (если есть)
    if (currentImageId) {
      try {
        await skillTreeAPI.deleteImage(currentImageId)
        console.log('🗑️ Изображение удалено:', currentImageId)
        toast.success('Изображение удалено')
      } catch (error) {
        console.warn('Не удалось удалить изображение:', error)
        // Не показываем ошибку, т.к. UI уже обновлен
      }
    }
  }

  // Сохранение изменений
  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Введите название навыка')
      return
    }

    onSave({
      title: title.trim(),
      image: image,      // URL для отображения
      imageId: imageId,  // ID для публикации
    })

    toast.success('Навык успешно обновлен')
    // Закрываем диалог
    onOpenChange(false)
  }

  // Закрытие диалога
  const handleClose = () => {
    onOpenChange(false)
  }

  if (!skill) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать навык</DialogTitle>
          <DialogDescription>
            Измените название и изображение навыка
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Название навыка */}
          <div className="space-y-2">
            <Label htmlFor="skill-title">Название навыка *</Label>
            <Input
              id="skill-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название навыка"
              maxLength={100}
            />
          </div>

          {/* Изображение */}
          <div className="space-y-2">
            <Label>Изображение навыка</Label>

            {/* Preview изображения */}
            {image ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Нет изображения
                  </p>
                </div>
              </div>
            )}

            {/* Кнопка загрузки */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка на сервер...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {image ? 'Изменить изображение' : 'Загрузить изображение'}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              {isUploading
                ? 'Изображение загружается на сервер...'
                : 'Форматы: JPG, PNG, GIF. Максимальный размер: 5MB'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить изменения
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
