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
  
  const { token, isAuthenticated } = useUser()

  // Загрузка студентов
  const fetchStudents = async () => {
    if (!token || !isAuthenticated) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await studentAPI.getMyStudents(token)
      setStudents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки студентов')
    } finally {
      setIsLoading(false)
    }
  }

  // Создание студента
  const createStudent = async (data: CreateStudentData): Promise<Student | null> => {
    if (!token) return null

    try {
      const newStudent = await studentAPI.createStudent(data, token)
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
  }, [token, isAuthenticated])

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