"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { invoiceAPI, type Invoice, type UpdateInvoiceData } from "@/entities/invoice/api/invoiceApi"

interface StudentEditDialogProps {
  isOpen: boolean
  onClose: () => void
  invoiceDocumentId: string
  onStudentUpdated?: () => void
}

interface EditFormData {
  name: string
  family: string
  sum: number
  currency: string
  startDate: string
  endDate: string
  statusPayment: boolean
}

export function StudentEditDialog({
  isOpen,
  onClose,
  invoiceDocumentId,
  onStudentUpdated
}: StudentEditDialogProps) {
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    family: '',
    sum: 0,
    currency: 'RUB',
    startDate: '',
    endDate: '',
    statusPayment: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  useEffect(() => {
    if (isOpen && invoiceDocumentId) {
      loadInvoiceData()
    }
  }, [isOpen, invoiceDocumentId])

  const loadInvoiceData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('jwt') || ''
      const invoice = await invoiceAPI.getInvoice(invoiceDocumentId, token)

      setFormData({
        name: invoice.name,
        family: invoice.family,
        sum: invoice.sum,
        currency: invoice.currency,
        startDate: invoice.startDate,
        endDate: invoice.endDate,
        statusPayment: invoice.statusPayment
      })

      setStartDate(new Date(invoice.startDate))
      setEndDate(new Date(invoice.endDate))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.family.trim()) {
      setError('Имя и фамилия обязательны')
      return
    }

    if (formData.sum <= 0) {
      setError('Сумма должна быть больше 0')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const token = localStorage.getItem('jwt') || ''
      
      const updateData: UpdateInvoiceData = {
        name: formData.name.trim(),
        family: formData.family.trim(),
        sum: formData.sum,
        currency: formData.currency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        statusPayment: formData.statusPayment
      }

      await invoiceAPI.updateInvoice(invoiceDocumentId, updateData, token)

      onStudentUpdated?.()
      onClose()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      setFormData(prev => ({
        ...prev,
        startDate: date.toISOString().split('T')[0]
      }))
    }
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      setFormData(prev => ({
        ...prev,
        endDate: date.toISOString().split('T')[0]
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Редактировать студента</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Загрузка данных...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadInvoiceData} variant="outline">
              Повторить попытку
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите имя"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="family">Фамилия *</Label>
                <Input
                  id="family"
                  value={formData.family}
                  onChange={(e) => setFormData(prev => ({ ...prev, family: e.target.value }))}
                  placeholder="Введите фамилию"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sum">Сумма *</Label>
                <Input
                  id="sum"
                  type="number"
                  value={formData.sum}
                  onChange={(e) => setFormData(prev => ({ ...prev, sum: Number(e.target.value) }))}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Валюта</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  placeholder="RUB"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата начала обучения</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Дата окончания обучения</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP", { locale: ru }) : "Выберите дату"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="statusPayment"
                checked={formData.statusPayment}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, statusPayment: checked }))}
              />
              <Label htmlFor="statusPayment" className="text-sm font-medium">
                Оплачено
              </Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}