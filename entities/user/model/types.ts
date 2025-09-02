/**
 * Типы для сущности пользователя
 * @layer entities/user
 */

export interface User {
  id: number
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  role?: UserRole
}

export interface UserRole {
  id: number
  name: string
  description: string
  type: string
}

export interface AuthSession {
  jwt: string
  user: User
}

export interface LoginCredentials {
  identifier: string // email или username
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  code: string
  password: string
  passwordConfirmation: string
}