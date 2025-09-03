"use client"

/**
 * Хук для работы с преподавателями
 * @layer entities/user
 */

import { useState, useEffect } from 'react'
import { getTeachers, Teacher } from '../api/teacherApi'

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      setError(null)
      const teachersData = await getTeachers()
      setTeachers(teachersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке преподавателей')
      console.error('Ошибка загрузки преподавателей:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  return { teachers, loading, error, refetch: fetchTeachers }
}