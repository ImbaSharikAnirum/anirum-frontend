"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  User, 
  Copy, 
  ExternalLink,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserContactData {
  id: number
  documentId: string
  username: string
  email: string
  name?: string
  family?: string
  whatsapp_phone?: string
  telegram_username?: string
  telegram_phone?: string
  avatar?: {
    url: string
    alternativeText?: string
  }
  confirmed: boolean
  blocked: boolean
}

interface StudentContactDialogProps {
  isOpen: boolean
  onClose: () => void
  studentName: string
  studentFamily: string
  invoiceDocumentId: string
}

export function StudentContactDialog({
  isOpen,
  onClose,
  studentName,
  studentFamily,
  invoiceDocumentId
}: StudentContactDialogProps) {
  const [userData, setUserData] = useState<UserContactData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && invoiceDocumentId) {
      // Сбрасываем предыдущие данные при открытии
      setUserData(null)
      setError(null)
      loadUserData()
    }
  }, [isOpen, invoiceDocumentId])

  const loadUserData = async () => {
    if (!invoiceDocumentId) {
      setError('Отсутствует ID счета')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Получаем invoice с owner через API route
      const invoiceResponse = await fetch(`/api/invoices/${invoiceDocumentId}?populate[owner][populate]=avatar`, {
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!invoiceResponse.ok) {
        throw new Error('Не удалось загрузить данные счета')
      }

      const invoiceData = await invoiceResponse.json()
      
      if (!invoiceData.data?.owner) {
        throw new Error('У счета нет владельца')
      }

      // Устанавливаем данные owner
      setUserData(invoiceData.data.owner)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(label)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const openWhatsApp = (phone: string) => {
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank')
  }

  const openTelegram = (username: string) => {
    window.open(`https://t.me/${username.replace('@', '')}`, '_blank')
  }

  const getUserInitials = (name?: string, family?: string, username?: string) => {
    if (name && family) {
      return `${name[0]}${family[0]}`.toUpperCase()
    }
    if (username) {
      return username.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getFullName = () => {
    if (userData?.name && userData?.family) {
      return `${userData.name} ${userData.family}`
    }
    return userData?.username || 'Пользователь'
  }

  const getUserStatus = () => {
    if (userData?.blocked) {
      return { text: 'Заблокирован', variant: 'destructive' as const, icon: AlertCircle }
    }
    if (!userData?.confirmed) {
      return { text: 'Не подтвержден', variant: 'secondary' as const, icon: AlertCircle }
    }
    return { text: 'Активен', variant: 'default' as const, icon: CheckCircle }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Связь со студентом
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Загрузка данных...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadUserData} variant="outline">
              Повторить попытку
            </Button>
          </div>
        ) : userData ? (
          <div className="space-y-4">
            {/* Информация о студенте и владельце аккаунта */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={userData.avatar?.url} 
                      alt={userData.avatar?.alternativeText || getFullName()}
                    />
                    <AvatarFallback>
                      {getUserInitials(userData.name, userData.family, userData.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-medium">{getFullName()}</h3>
                    <p className="text-sm text-gray-600">@{userData.username}</p>
                    <div className="mt-1">
                      <Badge variant={getUserStatus().variant} className="text-xs">
                        {(() => {
                          const IconComponent = getUserStatus().icon
                          return <IconComponent className="w-3 h-3 mr-1" />
                        })()}
                        {getUserStatus().text}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600">
                  Владелец записи: <span className="font-medium">{studentName} {studentFamily}</span>
                </p>
              </CardContent>
            </Card>

            {/* Контактная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Контакты</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Email */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-sm text-gray-600">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(userData.email, 'Email')}
                    >
                      {copiedText === 'Email' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`mailto:${userData.email}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* WhatsApp */}
                {userData.whatsapp_phone && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">WhatsApp</p>
                        <p className="text-sm text-gray-600">{userData.whatsapp_phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(userData.whatsapp_phone!, 'WhatsApp')}
                      >
                        {copiedText === 'WhatsApp' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openWhatsApp(userData.whatsapp_phone!)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Telegram */}
                {(userData.telegram_username || userData.telegram_phone) && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">Telegram</p>
                        {userData.telegram_username ? (
                          <p className="text-sm text-gray-600">@{userData.telegram_username}</p>
                        ) : (
                          <p className="text-sm text-gray-600">{userData.telegram_phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          userData.telegram_username || userData.telegram_phone!, 
                          'Telegram'
                        )}
                      >
                        {copiedText === 'Telegram' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      {userData.telegram_username && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openTelegram(userData.telegram_username!)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Если нет дополнительных контактов */}
                {!userData.whatsapp_phone && !userData.telegram_username && !userData.telegram_phone && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Дополнительные контакты не указаны
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}