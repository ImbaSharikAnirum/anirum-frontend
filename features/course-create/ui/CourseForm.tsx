"use client"

import { useState } from 'react'
import { FileUpload } from '@/components/ui/file-upload'
import { useFileUpload, formatBytes, type FileMetadata } from '@/hooks/use-file-upload'
import { WeekDaysSelector } from '@/shared/ui/week-days-selector'
import { NumberSelector } from '@/shared/ui/number-selector'
import { OptionSelector } from '@/shared/ui/option-selector'
import { AddressAutocomplete } from '@/shared/ui/address-autocomplete'
import { 
  DirectionFilter,
  FormatFilter,
  TeacherFilter
} from '@/features/courses-filters/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useCreateCourse } from '../model/useCreateCourse'
import { useEditCourse } from '@/features/course-edit'
import { TimezoneFilter } from '@/shared/ui/timezone-filter'
import { IncomeCalculator } from '@/widgets/income-calculator'
import { useUser } from '@/entities/user'
import { useRole } from '@/shared/hooks'
import { Course } from '@/entities/course'
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

// FileUpload компонент с поддержкой initialImages
interface FileUploadWithInitialImagesProps {
  onFilesChange?: (files: File[]) => void
  onAllFilesChange?: (files: any[]) => void // Для всех файлов включая существующие
  maxFiles?: number
  minFiles?: number
  maxSizeMB?: number
  initialImages?: FileMetadata[]
}

function FileUploadWithInitialImages({ 
  onFilesChange, 
  onAllFilesChange,
  maxFiles = 10, 
  minFiles = 5, 
  maxSizeMB = 5,
  initialImages = []
}: FileUploadWithInitialImagesProps) {
  const maxSize = maxSizeMB * 1024 * 1024

  const [activeId, setActiveId] = React.useState<string | null>(null)

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
    initialFiles: initialImages,
  })

  // Обработка изменений файлов
  React.useEffect(() => {
    const actualFiles = files
      .map(f => f.file)
      .filter((file): file is File => file instanceof File)
    onFilesChange?.(actualFiles)
    
    // Передаем все файлы для сохранения порядка изображений
    onAllFilesChange?.(files)
  }, [files, onFilesChange, onAllFilesChange])

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
        
        <div className="absolute top-2 left-2 p-1 rounded bg-black/50 text-white opacity-70 pointer-events-none">
          <GripVerticalIcon className="size-3" />
        </div>
        
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
            {file.file instanceof File ? formatBytes(file.file.size) : formatBytes(file.file.size || 0)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={files.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
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

interface CourseFormProps {
  mode?: 'create' | 'edit'
  initialData?: Course
  onSuccess?: (course: Course) => void
}

export function CourseForm({ mode = 'create', initialData, onSuccess }: CourseFormProps) {
  const { createCourse, isLoading: createLoading, error: createError } = useCreateCourse()
  const { updateCourse, isLoading: updateLoading, error: updateError } = useEditCourse()
  const { user } = useUser()
  const { isManager } = useRole()
  
  const isLoading = mode === 'create' ? createLoading : updateLoading
  const error = mode === 'create' ? createError : updateError
  
  // Функция для преобразования данных курса в форму
  const courseToFormData = (course?: Course) => {
    if (!course) {
      return {
        description: '',
        direction: '',
        teacher: null as string | null,
        startTime: '',
        endTime: '',
        startDate: undefined as Date | undefined,
        endDate: undefined as Date | undefined,
        timezone: 'Europe/Moscow',
        pricePerLesson: '',
        currency: 'RUB',
        country: '',
        city: '',
        address: '',
        isOnline: undefined as boolean | undefined,
        minStudents: 1,
        maxStudents: 10,
        startAge: '8',
        endAge: '17',
        complexity: 'beginner',
        courseType: 'club',
        language: 'Русский',
        inventoryRequired: false,
        inventoryDescription: '',
        rentalPrice: '',
        software: '',
        urlMessenger: '',
        googlePlaceId: '',
        coordinates: null as { lat: number; lng: number } | null
      }
    }
    
    return {
      description: course.description || '',
      direction: course.direction || '',
      teacher: course.teacher?.documentId || null,
      startTime: course.startTime ? course.startTime.slice(0, 5) : '',
      endTime: course.endTime ? course.endTime.slice(0, 5) : '',
      startDate: course.startDate ? new Date(course.startDate) : undefined,
      endDate: course.endDate ? new Date(course.endDate) : undefined,
      timezone: course.timezone || 'Europe/Moscow',
      pricePerLesson: course.pricePerLesson?.toString() || '',
      currency: course.currency || 'RUB',
      country: course.country || '',
      city: course.city || '',
      address: course.address || '',
      isOnline: course.isOnline,
      minStudents: course.minStudents || 1,
      maxStudents: course.maxStudents || 10,
      startAge: course.startAge?.toString() || '8',
      endAge: course.endAge?.toString() || '17',
      complexity: course.complexity || 'beginner',
      courseType: course.courseType || 'club',
      language: course.language || 'Русский',
      inventoryRequired: course.inventoryRequired || false,
      inventoryDescription: course.inventoryDescription || '',
      rentalPrice: course.rentalPrice?.toString() || '',
      software: course.software || '',
      urlMessenger: course.urlMessenger || '',
      googlePlaceId: course.googlePlaceId || '',
      coordinates: course.coordinates || null
    }
  }
  
  // Преобразование изображений курса для FileUpload
  const convertCourseImagesToFileMetadata = (course?: Course) => {
    if (!course?.images) return []
    
    return course.images.map((image, index) => {
      if (typeof image === 'string') {
        return {
          id: `existing-${index}`,
          name: `image-${index + 1}.jpg`,
          size: 0,
          type: 'image/jpeg',
          url: image,
          strapiId: index // Добавляем для простоты, хотя для строк ID неизвестен
        }
      } else {
        return {
          id: `existing-${image.id}`,
          name: image.name,
          size: image.size,
          type: image.mime,
          url: image.url,
          strapiId: image.id // Сохраняем оригинальный Strapi ID
        }
      }
    })
  }

  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialData?.weekdays || ['saturday']
  )
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [allFiles, setAllFiles] = useState<any[]>([]) // Все файлы включая существующие
  const [formData, setFormData] = useState(courseToFormData(initialData))
  const [initialImages] = useState(() => convertCourseImagesToFileMetadata(initialData))

  const handleInputChange = (field: string, value: string | boolean | Date | number | null | undefined) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Определяем teacher на основе роли пользователя
      const courseData = { ...formData }
      
      if (isManager) {
        // Менеджер: обязательно должен выбрать преподавателя
        if (!courseData.teacher) {
          alert('Выберите преподавателя для курса')
          return
        }
      } else {
        // Преподаватель: автоматически устанавливаем его documentId как teacher
        courseData.teacher = user?.documentId || null
        if (!courseData.teacher) {
          alert('Ошибка: не удалось получить documentId пользователя')
          return
        }
      }
      
      let result
      if (mode === 'create') {
        result = await createCourse(courseData, selectedDays, imageFiles)
      } else if (mode === 'edit' && initialData?.documentId) {
        result = await updateCourse(initialData.documentId, courseData, selectedDays, imageFiles, allFiles)
      }
      
      if (result && onSuccess) {
        onSuccess(result)
      }
    } catch (err) {
      // Ошибка уже обработана в хуках
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-8 mb-6">
        <div className="md:flex-shrink-0 md:w-120">
          <FileUploadWithInitialImages
            onFilesChange={setImageFiles}
            onAllFilesChange={setAllFiles}
            maxFiles={10}
            minFiles={5}
            maxSizeMB={10}
            initialImages={initialImages}
          />
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap gap-4">
            <DirectionFilter 
              value={formData.direction}
              onDirectionChange={(direction) => handleInputChange('direction', direction)}
            />
            <FormatFilter 
              value={formData.isOnline === undefined ? undefined : (formData.isOnline ? 'online' : 'offline')}
              cityValue={formData.city}
              onFormatAndLocationChange={(format, city) => {
                handleInputChange('isOnline', format === 'online' ? true : format === 'offline' ? false : undefined)
                if (city) {
                  handleInputChange('city', city)
                }
              }}
            />
            {isManager && (
              <TeacherFilter 
                value={formData.teacher}
                onTeacherChange={(teacherId) => handleInputChange('teacher', teacherId)}
              />
            )}
          </div>
          <WeekDaysSelector 
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
          />
          
          <div className="space-y-6">
            <OptionSelector
              selectedValue={formData.courseType}
              onValueChange={(value) => handleInputChange('courseType', value)}
              options={[
                { value: "club", label: "Кружок" },
                { value: "course", label: "Курс" },
                { value: "intensive", label: "Интенсив" },
                { value: "individual", label: "Индивидуальное" }
              ]}
              label="Тип курса"
            />
            
            <OptionSelector
              selectedValue={formData.complexity}
              onValueChange={(value) => handleInputChange('complexity', value)}
              options={[
                { value: "beginner", label: "Начинающий" },
                { value: "experienced", label: "Опытный" },
                { value: "professional", label: "Профессиональный" }
              ]}
              label="Уровень сложности"
            />
          </div>

          <div>
            <Label className="mb-2 block">Язык проведения</Label>
            <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
              <SelectTrigger className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Русский">Русский</SelectItem>
                <SelectItem value="Английский">Английский</SelectItem>
                <SelectItem value="Казахский">Казахский</SelectItem>
                <SelectItem value="Украинский">Украинский</SelectItem>
                <SelectItem value="Французский">Французский</SelectItem>
                <SelectItem value="Немецкий">Немецкий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="w-auto">
              <Label className="mb-2 block">Дата начала</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-auto",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "dd MMM yyyy", { locale: ru })
                    ) : (
                      "Выберите дату"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => handleInputChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-auto">
              <Label className="mb-2 block">Дата окончания</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-auto",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "dd MMM yyyy", { locale: ru })
                    ) : (
                      "Выберите дату"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => handleInputChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="w-auto">
              <Label className="mb-2 block">Время начала</Label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="w-auto">
              <Label className="mb-2 block">Время окончания</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="w-auto">
              <Label className="mb-2 block">Часовой пояс</Label>
              <TimezoneFilter
                value={formData.timezone}
                onTimezoneChange={(value) => handleInputChange('timezone', value)}
                className="w-auto min-w-[200px]"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-auto">
              <Label className="mb-2 block">Цена за урок</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.pricePerLesson}
                onChange={(e) => handleInputChange('pricePerLesson', e.target.value)}
                placeholder="0"
                className="w-32"
              />
            </div>
            {formData.isOnline === false && (
              <div className="w-auto">
                <Label className="mb-2 block">Цена аренды за занятие</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.rentalPrice}
                  onChange={(e) => handleInputChange('rentalPrice', e.target.value)}
                  placeholder="0"
                  className="w-32"
                />
              </div>
            )}
            <div className="w-auto">
              <Label className="mb-2 block">Валюта</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RUB">RUB</SelectItem>
                  <SelectItem value="KZT">KZT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          <div className="space-y-6">
            
            <div className="flex gap-4">
              <div className="w-auto">
                <Label className="mb-2 block">Возраст от</Label>
                <Input
                  type="number"
                  min="3"
                  max="99"
                  value={formData.startAge}
                  onChange={(e) => handleInputChange('startAge', e.target.value)}
                  placeholder="3"
                  className="w-auto"
                />
              </div>
              <div className="w-auto">
                <Label className="mb-2 block">Возраст до</Label>
                <Input
                  type="number"
                  min="3"
                  max="99"
                  value={formData.endAge}
                  onChange={(e) => handleInputChange('endAge', e.target.value)}
                  placeholder="99"
                  className="w-auto"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inventoryRequired"
                checked={formData.inventoryRequired}
                onCheckedChange={(checked) => handleInputChange('inventoryRequired', !!checked)}
              />
              <Label htmlFor="inventoryRequired">Требуется инвентарь</Label>
            </div>
            
            {formData.inventoryRequired && (
              <div>
                <Label className="mb-2 block">Описание необходимого инвентаря</Label>
                <Textarea
                  value={formData.inventoryDescription}
                  onChange={(e) => handleInputChange('inventoryDescription', e.target.value)}
                  placeholder="Опишите необходимые материалы и инструменты..."
                />
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Используемое ПО</Label>
            <Input
              value={formData.software}
              onChange={(e) => handleInputChange('software', e.target.value)}
              placeholder="Adobe Photoshop, Blender, и т.д."
            />
          </div>

          <div>
            <Label className="mb-2 block">Ссылка на мессенджер</Label>
            <Input
              type="url"
              value={formData.urlMessenger}
              onChange={(e) => handleInputChange('urlMessenger', e.target.value)}
              placeholder="https://t.me/your_group или https://wa.me/your_number"
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">Описание курса</Label>
            <Textarea
              id="description"
              placeholder="Подробное описание курса..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberSelector
              selectedNumber={formData.minStudents}
              onNumberChange={(number) => handleInputChange('minStudents', number)}
              min={1}
              max={10}
              label="Минимум студентов"
            />
            <NumberSelector
              selectedNumber={formData.maxStudents}
              onNumberChange={(number) => handleInputChange('maxStudents', number)}
              min={1}
              max={10}
              label="Максимум студентов"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Калькулятор доходов */}
          {formData.pricePerLesson && parseFloat(formData.pricePerLesson) > 0 && selectedDays.length > 0 && (
            <IncomeCalculator
              pricePerLesson={parseFloat(formData.pricePerLesson) || 0}
              minStudents={formData.minStudents}
              maxStudents={formData.maxStudents}
              selectedDays={selectedDays}
              startDate={formData.startDate}
              endDate={formData.endDate}
              rentalPrice={parseFloat(formData.rentalPrice) || 0}
              currency={formData.currency}
              isOnline={formData.isOnline}
              showCompanyProfit={isManager}
            />
          )}

          <div className="flex flex-wrap gap-4 pt-4">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading 
                ? (mode === 'create' ? 'Создание...' : 'Сохранение...') 
                : (mode === 'create' ? 'Создать курс' : 'Сохранить изменения')
              }
            </Button>
            {/* <Button type="button" variant="outline" size="lg">
              Сохранить как черновик
            </Button> */}
          </div>
        </div>
      </div>
    </form>
  )
}