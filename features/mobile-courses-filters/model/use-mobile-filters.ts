"use client"

import { useState } from "react"

export function useMobileFilters() {
  // Основные состояния фильтров (соответствуют основной системе)
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<'online' | 'offline' | null>(null)
  const [locationQuery, setLocationQuery] = useState("")
  const [age, setAge] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null)
  
  // Временные состояния для диалога
  const [tempSelectedDirection, setTempSelectedDirection] = useState<string | null>(null)
  const [tempSelectedFormat, setTempSelectedFormat] = useState<'online' | 'offline' | null>(null)
  const [tempLocationQuery, setTempLocationQuery] = useState("")
  const [tempAge, setTempAge] = useState("")
  const [tempSelectedTeacher, setTempSelectedTeacher] = useState<string | null>(null)
  
  // Состояния раскрытия карточек
  const [directionExpanded, setDirectionExpanded] = useState(true)
  const [formatExpanded, setFormatExpanded] = useState(false)
  const [ageExpanded, setAgeExpanded] = useState(false)
  const [teacherExpanded, setTeacherExpanded] = useState(false)

  // Инициализация временных состояний при открытии диалога
  const initializeTempStates = () => {
    setTempSelectedDirection(selectedDirection)
    setTempSelectedFormat(selectedFormat)
    setTempLocationQuery(locationQuery)
    setTempAge(age)
    setTempSelectedTeacher(selectedTeacher)
  }

  // Обработчики для направлений
  const handleDirectionSelect = (direction: string) => {
    setTempSelectedDirection(direction)
    setDirectionExpanded(false)
    // Закрываем другие секции
    setFormatExpanded(false)
    setAgeExpanded(false)
    setTeacherExpanded(false)
  }

  const toggleDirectionExpanded = () => {
    setDirectionExpanded(true)
    setFormatExpanded(false)
    setAgeExpanded(false)
    setTeacherExpanded(false)
  }

  // Обработчики для форматов
  const handleFormatSelect = (format: 'online' | 'offline') => {
    setTempSelectedFormat(format)
    if (format === "online") {
      setTempLocationQuery("")
      setFormatExpanded(false)
    }
  }

  const handleLocationSelect = (location: string) => {
    setTempLocationQuery(location)
    setFormatExpanded(false)
  }

  const toggleFormatExpanded = () => {
    setFormatExpanded(true)
    setDirectionExpanded(false)
    setAgeExpanded(false)
    setTeacherExpanded(false)
  }

  // Обработчики для возраста
  const handleAgeApply = () => {
    if (tempAge.trim() && parseInt(tempAge) > 0) {
      setAgeExpanded(false)
    }
  }

  const toggleAgeExpanded = () => {
    setAgeExpanded(true)
    setDirectionExpanded(false)
    setFormatExpanded(false)
    setTeacherExpanded(false)
  }

  // Обработчики для преподавателя
  const handleTeacherSelect = (teacherId: string | null) => {
    setTempSelectedTeacher(teacherId === tempSelectedTeacher ? null : teacherId)
    setTeacherExpanded(false)
  }

  const toggleTeacherExpanded = () => {
    setTeacherExpanded(true)
    setDirectionExpanded(false)
    setFormatExpanded(false)
    setAgeExpanded(false)
  }

  // Применение фильтров
  const applyFilters = () => {
    setSelectedDirection(tempSelectedDirection)
    setSelectedFormat(tempSelectedFormat)
    setLocationQuery(tempLocationQuery)
    setAge(tempAge)
    setSelectedTeacher(tempSelectedTeacher)
  }

  // Сброс фильтров
  const resetFilters = () => {
    setTempSelectedDirection(null)
    setTempSelectedFormat(null)
    setTempLocationQuery("")
    setTempAge("")
    setTempSelectedTeacher(null)
    setDirectionExpanded(true)
    setFormatExpanded(false)
    setAgeExpanded(false)
    setTeacherExpanded(false)
  }

  return {
    // Основные состояния
    selectedDirection,
    selectedFormat,
    locationQuery,
    age,
    selectedTeacher,
    
    // Временные состояния
    tempSelectedDirection,
    tempSelectedFormat,
    tempLocationQuery,
    tempAge,
    tempSelectedTeacher,
    
    // Состояния раскрытия
    directionExpanded,
    formatExpanded,
    ageExpanded,
    teacherExpanded,
    
    // Методы управления состоянием
    setTempLocationQuery,
    setTempAge,
    initializeTempStates,
    
    // Обработчики
    handleDirectionSelect,
    toggleDirectionExpanded,
    handleFormatSelect,
    handleLocationSelect,
    toggleFormatExpanded,
    handleAgeApply,
    toggleAgeExpanded,
    handleTeacherSelect,
    toggleTeacherExpanded,
    
    // Применение/сброс
    applyFilters,
    resetFilters,
  }
}