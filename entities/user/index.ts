/**
 * Сущность пользователя - Public API
 * @layer entities/user
 */

export { userAuthAPI } from './api/auth'
export { getTeachers, getTeacherById, type Teacher } from './api/teacherApi'
export { UserProvider, useUser } from './model/store'
export { useTeachers } from './model/useTeachers'
export type { 
  User, 
  UserRole,
  AuthSession,
  LoginCredentials, 
  RegisterCredentials, 
  ForgotPasswordData, 
  ResetPasswordData 
} from './model/types'