"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { courseAPI, UpdateCourseData } from '@/entities/course'
import { useUser } from '@/entities/user'

export function useEditCourse() {
  const { user } = useUser()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateCourse = async (
    documentId: string,
    formData: UpdateCourseData, 
    selectedDays: string[], 
    imageFiles?: File[],
    allFiles?: any[]
  ) => {
    if (!user) {
      const errorMessage = 'Необходимо войти в систему'
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await courseAPI.updateCourse(documentId, formData, selectedDays, imageFiles, allFiles)
      
      // Успешное обновление курса
      toast.success('Курс успешно обновлен!')
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка при обновлении курса'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Ошибка при обновлении курса:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateCourse: handleUpdateCourse,
    isLoading,
    error
  }
}