'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { DatePicker } from '@/components/ui/date-picker'
import { Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { useStudents, type Student, type CreateStudentData } from '@/entities/student'
import { useUser } from '@/entities/user/model/store'
import { toast } from 'sonner'
import type { ContactData } from './ContactStep'
import { formatDateWithoutTimezone, parseDateWithoutTimezone } from '@/shared/lib/date-utils'

interface StudentStepProps {
  onNext: () => void
  onDataChange: (data: StudentData) => void
  initialData?: StudentData
  courseStartAge?: number | null
  courseEndAge?: number | null
  contactData?: ContactData
}

export interface StudentData {
  studentType: 'myself' | 'existing' | 'new' | null
  selectedStudent: Student | null
  studentFirstName: string
  studentLastName: string
  studentBirthDate: Date | undefined
}

export function StudentStep({ onNext, onDataChange, initialData, courseStartAge, courseEndAge, contactData }: StudentStepProps) {
  const [studentType, setStudentType] = useState<'myself' | 'existing' | 'new' | null>(initialData?.studentType || null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(initialData?.selectedStudent || null)
  const [studentFirstName, setStudentFirstName] = useState(initialData?.studentFirstName || '')
  const [studentLastName, setStudentLastName] = useState(initialData?.studentLastName || '')
  const [studentBirthDate, setStudentBirthDate] = useState<Date | undefined>(initialData?.studentBirthDate)
  const [isCreating, setIsCreating] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editName, setEditName] = useState('')
  const [editFamily, setEditFamily] = useState('')
  const [editBirthDate, setEditBirthDate] = useState<Date | undefined>(undefined)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  
  const { students, isLoading, createStudent, updateStudent, deleteStudent } = useStudents()
  const { user } = useUser()

  const calculateAge = (birthDate: string) => {
    const birth = parseDateWithoutTimezone(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const getUserAge = () => {
    // Проверяем сначала обновленные данные пользователя, потом локальные данные из контакт-формы
    const birthDate = user?.birth_date || (contactData?.birthDate ? format(contactData.birthDate, 'yyyy-MM-dd') : null)
    if (!birthDate) return null
    return calculateAge(birthDate)
  }

  const validateAge = (age: number): { isValid: boolean; message?: string } => {
    if (!courseStartAge && !courseEndAge) {
      return { isValid: true }
    }

    const ageStart = courseStartAge || 0
    const ageEnd = courseEndAge || Infinity

    if (age < ageStart) {
      return { 
        isValid: false, 
        message: `Минимальный возраст для курса: ${ageStart} лет. Текущий возраст: ${age} лет` 
      }
    }

    if (ageEnd !== Infinity && age > ageEnd) {
      return { 
        isValid: false, 
        message: `Максимальный возраст для курса: ${ageEnd} лет. Текущий возраст: ${age} лет` 
      }
    }

    return { isValid: true }
  }

  const getCurrentStudentAge = (): number | null => {
    if (studentType === 'myself') {
      return getUserAge()
    } else if (studentType === 'existing' && selectedStudent) {
      return calculateAge(selectedStudent.age)
    } else if (studentType === 'new' && studentBirthDate) {
      return calculateAge(formatDateWithoutTimezone(studentBirthDate))
    }
    return null
  }

  const isAgeValid = (): boolean => {
    const currentAge = getCurrentStudentAge()
    if (currentAge === null) return true
    return validateAge(currentAge).isValid
  }

  // Проверяем возраст при изменении данных студента
  useEffect(() => {
    
    const currentAge = getCurrentStudentAge()
    
    if (currentAge !== null) {
      const validation = validateAge(currentAge)
      
      if (!validation.isValid && validation.message) {
        toast.error(validation.message)
      }
    }
  }, [studentType, selectedStudent, studentBirthDate, courseStartAge, courseEndAge])

  const handleDataChange = (updates: Partial<StudentData>) => {
    const newData = {
      studentType,
      selectedStudent,
      studentFirstName,
      studentLastName,
      studentBirthDate,
      ...updates
    }
    onDataChange(newData)
  }

  const handleStudentTypeChange = (type: 'myself' | 'existing' | 'new') => {
    setStudentType(type)
    setSelectedStudent(null)
    setStudentFirstName('')
    setStudentLastName('')
    setStudentBirthDate(undefined)
    handleDataChange({ 
      studentType: type, 
      selectedStudent: null,
      studentFirstName: '',
      studentLastName: '',
      studentBirthDate: undefined
    })
  }

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    handleDataChange({ selectedStudent: student })
  }

  const handleCreateStudent = async () => {
    if (!studentFirstName || !studentLastName || !studentBirthDate) return

    setIsCreating(true)
    try {
      const newStudent = await createStudent({
        name: studentFirstName,
        family: studentLastName,
        age: formatDateWithoutTimezone(studentBirthDate)
      })
      
      if (newStudent) {
        toast.success('Студент создан успешно')
        setSelectedStudent(newStudent)
        setStudentType('existing')
        handleDataChange({ 
          studentType: 'existing',
          selectedStudent: newStudent 
        })
      }
    } catch (error) {
      toast.error('Ошибка при создании студента')
    } finally {
      setIsCreating(false)
    }
  }

  const handleNext = async () => {
    // Если создаем нового студента, сначала сохраняем его
    if (studentType === 'new') {
      await handleCreateStudent()
      // После создания студента, переходим дальше
      setTimeout(() => onNext(), 500)
    } else if (studentType === 'myself') {
      // Для "я сам/сама" проверяем, что у пользователя есть дата рождения
      // Либо в обновленном профиле, либо в локальных данных из контакт-формы
      const birthDate = user?.birth_date || (contactData?.birthDate ? format(contactData.birthDate, 'yyyy-MM-dd') : null)
      
      if (!birthDate) {
        toast.error('Для записи на курс необходимо указать дату рождения в профиле')
        return
      }
      onNext()
    } else {
      onNext()
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setEditName(student.name)
    setEditFamily(student.family)
    setEditBirthDate(parseDateWithoutTimezone(student.age))
  }

  const handleCancelEdit = () => {
    setEditingStudent(null)
    setEditName('')
    setEditFamily('')
    setEditBirthDate(undefined)
  }

  const handleSaveEdit = async () => {
    if (!editingStudent || !editName || !editFamily || !editBirthDate) return

    setIsUpdating(true)
    try {
      const updatedStudent = await updateStudent(editingStudent.documentId, {
        name: editName,
        family: editFamily,
        age: formatDateWithoutTimezone(editBirthDate)
      })

      if (updatedStudent) {
        toast.success('Студент успешно обновлен')
        handleCancelEdit()
      }
    } catch (error) {
      toast.error('Ошибка при обновлении студента')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteStudent = async (student: Student) => {
    setIsDeleting(student.id)
    try {
      const success = await deleteStudent(student.documentId)
      if (success) {
        toast.success(`Студент ${student.name} ${student.family} удален`)
        // Если удаляем выбранного студента, сбрасываем выбор
        if (selectedStudent?.id === student.id) {
          setSelectedStudent(null)
          handleDataChange({ selectedStudent: null })
        }
      } else {
        toast.error('Не удалось удалить студента')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка при удалении студента')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <Card className="p-6 gap-2">
      <h3 className="text-lg font-medium">Кто будет заниматься?</h3>
      <p className="text-sm text-gray-600 mb-4">
        Выберите, для кого вы записываетесь на курс.
      </p>

      <div className="space-y-4">
        {/* Опция "Я сам/сама" */}
        <div 
          className={`border rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer ${
            studentType === 'myself' ? 'border-gray-500 bg-gray-50' : ''
          }`}
          onClick={() => handleStudentTypeChange('myself')}
        >
          <div className="flex items-start space-x-3">
            <input 
              type="radio" 
              id="myself" 
              name="student" 
              checked={studentType === 'myself'}
              onChange={() => handleStudentTypeChange('myself')}
              className="mt-1 text-gray-600 focus:ring-gray-500"
            />
            <div className="flex-1">
              <label htmlFor="myself" className="cursor-pointer">
                <div className="font-medium">Я сам/сама</div>
                <div className="text-sm text-gray-600 mt-1">
                  Записываюсь на курс для себя
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Опция "Выбрать из существующих студентов" */}
        {students.length > 0 && (
          <div 
            className={`border rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer ${
              studentType === 'existing' ? 'border-gray-500 bg-gray-50' : ''
            }`}
            onClick={() => handleStudentTypeChange('existing')}
          >
            <div className="flex items-start space-x-3">
              <input 
                type="radio" 
                id="existing" 
                name="student" 
                checked={studentType === 'existing'}
                onChange={() => handleStudentTypeChange('existing')}
                className="mt-1 text-gray-600 focus:ring-gray-500"
              />
              <div className="flex-1">
                <label htmlFor="existing" className="cursor-pointer">
                  <div className="font-medium">Выбрать из списка</div>
                  <div className="text-sm text-gray-600 mt-1">
                    У вас есть {students.length} сохраненных студентов
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Опция "Добавить нового студента" */}
        <div 
          className={`border rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer ${
            studentType === 'new' ? 'border-gray-500 bg-gray-50' : ''
          }`}
          onClick={() => handleStudentTypeChange('new')}
        >
          <div className="flex items-start space-x-3">
            <input 
              type="radio" 
              id="new" 
              name="student" 
              checked={studentType === 'new'}
              onChange={() => handleStudentTypeChange('new')}
              className="mt-1 text-gray-600 focus:ring-gray-500"
            />
            <div className="flex-1">
              <label htmlFor="new" className="cursor-pointer">
                <div className="font-medium">Добавить нового студента</div>
                <div className="text-sm text-gray-600 mt-1">
                  Записываю кого-то нового (ребенка, друга, коллегу)
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Список существующих студентов */}
      {studentType === 'existing' && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium">Выберите студента:</h4>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Загрузка студентов...</div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div 
                  key={student.id}
                  className={`group border rounded-lg transition-colors ${
                    selectedStudent?.id === student.id ? 'border-gray-500 bg-gray-50' : 'hover:border-gray-400'
                  }`}
                >
                  {editingStudent?.id === student.id ? (
                    // Режим редактирования
                    <div className="p-3">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Имя"
                            className="text-sm"
                          />
                          <Input
                            value={editFamily}
                            onChange={(e) => setEditFamily(e.target.value)}
                            placeholder="Фамилия"
                            className="text-sm"
                          />
                        </div>
                        <DatePicker
                          selected={editBirthDate}
                          onSelect={setEditBirthDate}
                          placeholder="дд.мм.гггг"
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={!editName || !editFamily || !editBirthDate || isUpdating}
                            className="flex-1 h-8 text-xs"
                            size="sm"
                          >
                            {isUpdating ? 'Сохранение...' : 'Сохранить'}
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            disabled={isUpdating}
                            className="flex-1 h-8 text-xs"
                            size="sm"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Обычный режим
                    <div className="p-3 relative">
                      {/* Иконки управления в правом верхнем углу */}
                      <div className="absolute top-1 right-3 flex items-center gap-1">
                        <Button
                          onClick={() => handleEditStudent(student)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 disabled:opacity-50"
                              disabled={isDeleting === student.id}
                            >
                              {isDeleting === student.id ? (
                                <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
                              <AlertDialogDescription>
                                Вы уверены, что хотите удалить студента <strong>{student.name} {student.family}</strong>? 
                                Это действие нельзя отменить.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStudent(student)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isDeleting === student.id}
                              >
                                {isDeleting === student.id ? 'Удаление...' : 'Удалить'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      {/* Радио-кнопка отдельно */}
                      <input 
                        type="radio" 
                        checked={selectedStudent?.id === student.id}
                        onChange={() => handleStudentSelect(student)}
                        className="absolute bottom-3 right-3 text-gray-600 focus:ring-gray-500"
                      />
                      
                      {/* Контент студента */}
                      <div 
                        className="cursor-pointer pr-8 pb-2"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="font-medium">{student.name} {student.family}</div>
                        <div className="text-sm text-gray-500">
                          {calculateAge(student.age)} лет
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Форма для создания нового студента */}
      {studentType === 'new' && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-4">Данные нового студента</h4>
          
          <div className="space-y-4">
            {/* Имя и фамилия */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentFirstName">Имя студента</Label>
                <Input
                  id="studentFirstName"
                  value={studentFirstName}
                  onChange={(e) => setStudentFirstName(e.target.value)}
                  placeholder="Имя"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentLastName">Фамилия студента</Label>
                <Input
                  id="studentLastName"
                  value={studentLastName}
                  onChange={(e) => setStudentLastName(e.target.value)}
                  placeholder="Фамилия"
                  required
                />
              </div>
            </div>

            {/* Дата рождения */}
            <div className="space-y-2">
              <Label>Дата рождения</Label>
              <DatePicker
                selected={studentBirthDate}
                onSelect={setStudentBirthDate}
                placeholder="дд.мм.гггг"
              />
            </div>
          </div>
        </div>
      )}

      <Button 
        onClick={handleNext}
        className="w-full mt-6 "
        disabled={
          !studentType || 
          (studentType === 'existing' && !selectedStudent) ||
          (studentType === 'new' && (!studentFirstName || !studentLastName || !studentBirthDate)) ||
          !isAgeValid() ||
          isCreating
        }
      >
        {isCreating ? 'Создание студента...' : 'Далее'}
      </Button>
    </Card>
  )
}