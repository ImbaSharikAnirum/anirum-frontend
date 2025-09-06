/**
 * Экспорты сущности студента
 * @layer entities/student
 */

// Types
export type { Student, CreateStudentData, UpdateStudentData } from './model/types'

// API
export { studentAPI } from './api/studentApi'

// Hooks
export { useStudents } from './model/useStudents'