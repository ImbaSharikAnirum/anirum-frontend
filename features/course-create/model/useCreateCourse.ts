"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { courseAPI } from '@/entities/course'
import { CreateCourseData } from '@/entities/course'
import { useUser } from '@/entities/user'

export function useCreateCourse() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateCourse = async (formData: CreateCourseData, selectedDays: string[], imageFiles?: File[]) => {
    if (!user) {
      const errorMessage = 'Необходимо войти в систему'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await courseAPI.createCourse(formData, selectedDays, imageFiles)
      
      // Успешное создание курса
      toast.success('Курс успешно создан!')
      
      // Переход на страницу курса с documentId
      if (result.documentId) {
        router.push(`/courses/${result.documentId}`)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при создании курса'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Ошибка при создании курса:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCourse: handleCreateCourse,
    isLoading,
    error
  }
}