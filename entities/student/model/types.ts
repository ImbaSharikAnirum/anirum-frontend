/**
 * Типы для сущности студента
 * @layer entities/student
 */

export interface Student {
  id: number
  documentId: string
  name: string
  family: string
  age: string // дата рождения в ISO формате
  owner: {
    id: number
    email: string
    name?: string
    family?: string
  }
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface CreateStudentData {
  name: string
  family: string
  age: string // дата рождения в ISO формате
}

export interface UpdateStudentData {
  name?: string
  family?: string
  age?: string // дата рождения в ISO формате
}