"use client"

import { useState } from 'react'
import { FileUpload } from '@/components/ui/file-upload'
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

export function CourseForm() {
  const { createCourse, isLoading, error } = useCreateCourse()
  const [selectedDays, setSelectedDays] = useState<string[]>(['saturday'])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [formData, setFormData] = useState({
    description: '',
    direction: '',
    teacher: null as number | null,
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
    googlePlaceId: '',
    coordinates: null as { lat: number; lng: number } | null
  })

  const handleInputChange = (field: string, value: string | boolean | Date | number | null | undefined) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createCourse(formData, selectedDays, imageFiles)
    } catch (err) {
      // Ошибка уже обработана в хуке
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col md:flex-row gap-8 mb-6">
        <div className="md:flex-shrink-0 md:w-120">
          <FileUpload 
            onFilesChange={setImageFiles}
            maxFiles={5}
            minFiles={0}
            maxSizeMB={10}
          />
        </div>
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap gap-4">
            <DirectionFilter 
              defaultValue={formData.direction}
              onDirectionChange={(direction) => handleInputChange('direction', direction)}
            />
            <FormatFilter 
              defaultIsOnline={formData.isOnline}
              defaultLocation={formData.address}
              onFormatChange={(isOnline) => handleInputChange('isOnline', isOnline)}
              onLocationChange={(locationData) => {
                setFormData(prev => {
                  const newFormData = {
                    ...prev,
                    country: locationData.country,
                    city: locationData.city,
                    address: locationData.address,
                    googlePlaceId: locationData.googlePlaceId || '',
                    coordinates: locationData.coordinates || null
                  }
                  console.log('Обновляем formData с адресными данными:', newFormData)
                  return newFormData
                })
              }}
            />
            <TeacherFilter 
              defaultValue={formData.teacher}
              onTeacherChange={(teacherId) => handleInputChange('teacher', teacherId)}
            />
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

          <div className="flex gap-4">
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

          <div className="flex gap-4">
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
              <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                <SelectTrigger className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Moscow">Москва (GMT+3)</SelectItem>
                  <SelectItem value="Europe/Kazan">Казань (GMT+3)</SelectItem>
                  <SelectItem value="Asia/Yakutsk">Якутск (GMT+9)</SelectItem>
                  <SelectItem value="Asia/Vladivostok">Владивосток (GMT+10)</SelectItem>
                  <SelectItem value="Asia/Almaty">Алматы (GMT+6)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-auto">
              <Label className="mb-2 block">Цена за урок</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.pricePerLesson}
                onChange={(e) => handleInputChange('pricePerLesson', e.target.value)}
                placeholder="0.00"
                className="w-32"
              />
            </div>
            {formData.isOnline === false && (
              <div className="w-auto">
                <Label className="mb-2 block">Цена аренды помещения</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rentalPrice}
                  onChange={(e) => handleInputChange('rentalPrice', e.target.value)}
                  placeholder="0.00"
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
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Описание необходимого инвентаря</Label>
                  <Textarea
                    value={formData.inventoryDescription}
                    onChange={(e) => handleInputChange('inventoryDescription', e.target.value)}
                    placeholder="Опишите необходимые материалы и инструменты..."
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Цена аренды инвентаря</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rentalPrice}
                    onChange={(e) => handleInputChange('rentalPrice', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
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
            <Label htmlFor="description" className="mb-2 block">Описание курса</Label>
            <Textarea
              id="description"
              placeholder="Подробное описание курса..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? 'Создание...' : 'Создать курс'}
            </Button>
            <Button type="button" variant="outline" size="lg">
              Сохранить как черновик
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}