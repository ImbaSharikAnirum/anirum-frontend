'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

interface StudentStepProps {
  onNext: () => void
  onDataChange: (data: StudentData) => void
  initialData?: StudentData
}

export interface StudentData {
  studentType: 'myself' | 'other' | null
  studentFirstName: string
  studentLastName: string
  studentBirthDate: Date | undefined
}

export function StudentStep({ onNext, onDataChange, initialData }: StudentStepProps) {
  const [studentType, setStudentType] = useState<'myself' | 'other' | null>(initialData?.studentType || null)
  const [studentFirstName, setStudentFirstName] = useState(initialData?.studentFirstName || '')
  const [studentLastName, setStudentLastName] = useState(initialData?.studentLastName || '')
  const [studentBirthDate, setStudentBirthDate] = useState<Date | undefined>(initialData?.studentBirthDate)

  const handleDataChange = (updates: Partial<StudentData>) => {
    const newData = {
      studentType,
      studentFirstName,
      studentLastName,
      studentBirthDate,
      ...updates
    }
    onDataChange(newData)
  }

  const handleStudentTypeChange = (type: 'myself' | 'other') => {
    setStudentType(type)
    handleDataChange({ studentType: type })
  }

  const handleInputChange = (field: keyof StudentData, value: any) => {
    switch (field) {
      case 'studentFirstName':
        setStudentFirstName(value)
        break
      case 'studentLastName':
        setStudentLastName(value)
        break
      case 'studentBirthDate':
        setStudentBirthDate(value)
        break
    }
    handleDataChange({ [field]: value })
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium">Кто будет заниматься?</h3>
      <p className="text-sm text-gray-600 ">
        Выберите, для кого вы записываетесь на курс.
      </p>

      <div className="space-y-4">
        {/* Опция "Я сам/сама" */}
        <div 
          className={`border rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer ${
            studentType === 'myself' ? 'border-gray-500 bg-gray-100' : ''
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

        {/* Опция "Другой человек" */}
        <div 
          className={`border rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer ${
            studentType === 'other' ? 'border-gray-500 bg-gray-100' : ''
          }`}
          onClick={() => handleStudentTypeChange('other')}
        >
          <div className="flex items-start space-x-3">
            <input 
              type="radio" 
              id="other" 
              name="student" 
              checked={studentType === 'other'}
              onChange={() => handleStudentTypeChange('other')}
              className="mt-1 text-gray-600 focus:ring-gray-500"
            />
            <div className="flex-1">
              <label htmlFor="other" className="cursor-pointer">
                <div className="font-medium">Другой человек</div>
                <div className="text-sm text-gray-600 mt-1">
                  Записываю кого-то другого (ребенка, друга, коллегу)
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Форма для данных другого человека */}
      {studentType === 'other' && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-4">Данные ученика</h4>
          
          <form className="space-y-4">
            {/* Имя и фамилия */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentFirstName">Имя ученика</Label>
                <Input
                  id="studentFirstName"
                  value={studentFirstName}
                  onChange={(e) => handleInputChange('studentFirstName', e.target.value)}
                  placeholder="Имя"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentLastName">Фамилия ученика</Label>
                <Input
                  id="studentLastName"
                  value={studentLastName}
                  onChange={(e) => handleInputChange('studentLastName', e.target.value)}
                  placeholder="Фамилия"
                  required
                />
              </div>
            </div>

            {/* Дата рождения */}
            <div className="space-y-2">
              <Label htmlFor="studentBirthDate">Дата рождения</Label>
              <Input
                id="studentBirthDate"
                type="date"
                value={studentBirthDate ? format(studentBirthDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleInputChange('studentBirthDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-auto"
                required
              />
            </div>
          </form>
        </div>
      )}

      <Button 
        onClick={onNext}
        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white"
        disabled={
          !studentType || 
          (studentType === 'other' && (!studentFirstName || !studentLastName || !studentBirthDate))
        }
      >
        Далее
      </Button>
    </Card>
  )
}