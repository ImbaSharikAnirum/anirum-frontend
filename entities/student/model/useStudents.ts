/**
 * React хук для работы со студентами
 * @layer entities/student
 */

'use client'

import { useState, useEffect } from 'react'
import { studentAPI } from '../api/studentApi'
import { useUser } from '@/entities/user'
import type { Student, CreateStudentData, UpdateStudentData } from './types'

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false) // Флаг для предотвращения параллельных запросов
  
  const { token, isAuthenticated, user } = useUser()

  // Загрузка студентов
  const fetchStudents = async () => {
    if (!token || !isAuthenticated || !user || isFetching) {
      if (!isFetching) setIsLoading(false)
      return
    }

    try {
      setIsFetching(true)
      setIsLoading(true)
      setError(null)
      const data = await studentAPI.getMyStudents(token, user.id)
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки студентов')
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  // Создание студента
  const createStudent = async (data: CreateStudentData): Promise<Student | null> => {
    if (!token || !user) return null

    try {
      const newStudent = await studentAPI.createStudent(data, token, user.id)
      setStudents(prev => [newStudent, ...prev])
      return newStudent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка создания студента')
      return null
    }
  }

  // Обновление студента
  const updateStudent = async (documentId: string, data: UpdateStudentData): Promise<Student | null> => {
    if (!token) return null

    try {
      const updatedStudent = await studentAPI.updateStudent(documentId, data, token)
      setStudents(prev => prev.map(student => 
        student.documentId === documentId ? updatedStudent : student
      ))
      return updatedStudent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления студента')
      return null
    }
  }

  // Удаление студента
  const deleteStudent = async (documentId: string): Promise<boolean> => {
    if (!token) return false

    try {
      console.log('Deleting student with documentId:', documentId)
      await studentAPI.deleteStudent(documentId, token)
      setStudents(prev => prev.filter(student => student.documentId !== documentId))
      console.log('Student deleted successfully')
      return true
    } catch (err) {
      console.error('Delete student error:', err)
      setError(err instanceof Error ? err.message : 'Ошибка удаления студента')
      return false
    }
  }

  // Загружаем студентов при монтировании
  useEffect(() => {
    fetchStudents()
  }, [token, isAuthenticated, user?.id]) // Зависим только от user.id, а не от всего объекта user

  return {
    students,
    isLoading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents
  }
}