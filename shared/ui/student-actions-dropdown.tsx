"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, MessageCircle, User, Calendar, Trash2, Edit, Copy } from "lucide-react"
import { invoiceAPI } from "@/entities/invoice/api/invoiceApi"
import { StudentContactDialog } from "./student-contact-dialog"
import { StudentEditDialog } from "./student-edit-dialog"
import { toast } from "sonner"

type UserRole = 'Manager' | 'Teacher'

interface StudentActionsDropdownProps {
  studentId: string
  studentName: string
  studentFamily: string
  invoiceDocumentId: string
  courseId?: string
  className?: string
  onStudentDeleted?: () => void
  onStudentUpdated?: () => void
  role?: UserRole
}

export function StudentActionsDropdown({ 
  studentId, 
  studentName,
  studentFamily,
  invoiceDocumentId,
  courseId,
  className,
  onStudentDeleted,
  onStudentUpdated,
  role = 'Manager'
}: StudentActionsDropdownProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleContactClick = () => {
    if (!invoiceDocumentId) {
      console.warn('Нет ID счета для связи со студентом')
      return
    }
    setIsDropdownOpen(false)
    setIsContactDialogOpen(true)
  }

  const handleEditClick = () => {
    setIsDropdownOpen(false)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = () => {
    setIsDropdownOpen(false)
    setIsDeleteDialogOpen(true)
  }

  const handleCopyPaymentLink = async () => {
    if (!courseId || !invoiceDocumentId) {
      toast.error('Ошибка создания ссылки')
      return
    }
    
    const paymentUrl = `${window.location.origin}/courses/${courseId}/payment/${invoiceDocumentId}`
    
    try {
      await navigator.clipboard.writeText(paymentUrl)
      toast.success('Ссылка счета скопирована')
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = paymentUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Ссылка счета скопирована')
    }
    
    setIsDropdownOpen(false)
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      
      // Получаем токен из localStorage или context
      const token = localStorage.getItem('jwt') || ''
      
      await invoiceAPI.deleteInvoice(invoiceDocumentId, token)
      
      setIsDeleteDialogOpen(false)
      onStudentDeleted?.()
      
    } catch (error) {
      console.error('Ошибка при удалении студента:', error)
      // TODO: Добавить toast уведомление об ошибке
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleContactClick}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Связаться
          </DropdownMenuItem>
          {courseId && (
            <DropdownMenuItem onClick={handleCopyPaymentLink}>
              <Copy className="mr-2 h-4 w-4" />
              Ссылка оплаты
            </DropdownMenuItem>
          )}
          {/* Редактирование и удаление только для менеджеров */}
          {role === 'Manager' && (
            <DropdownMenuItem onClick={handleEditClick}>
              <Edit className="mr-2 h-4 w-4" />
              Редактировать
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            Профиль
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Calendar className="mr-2 h-4 w-4" />
            История
          </DropdownMenuItem>
          {role === 'Manager' && (
            <DropdownMenuItem 
              onClick={handleDeleteClick}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Удалить
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <StudentContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        studentName={studentName}
        studentFamily={studentFamily}
        invoiceDocumentId={invoiceDocumentId}
      />

      <StudentEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        invoiceDocumentId={invoiceDocumentId}
        onStudentUpdated={onStudentUpdated}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить студента</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить студента{" "}
              <span className="font-medium">{studentName} {studentFamily}</span>?
              <br />
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}