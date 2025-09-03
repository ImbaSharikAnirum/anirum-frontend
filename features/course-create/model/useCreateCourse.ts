"use client"

import { useState } from 'react'
import { courseAPI } from '@/entities/course/api/courseApi'
import { CreateCourseData } from '@/entities/course'
import { useUser } from '@/entities/user'

export function useCreateCourse() {
  const { token } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateCourse = async (formData: CreateCourseData, selectedDays: string[], imageFiles?: File[]) => {
    if (!token) {
      setError('Необходимо войти в систему')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await courseAPI.createCourse(formData, selectedDays, token, imageFiles)
      console.log('Курс создан успешно:', result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Произошла ошибка'
      setError(errorMessage)
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