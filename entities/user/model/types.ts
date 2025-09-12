/**
 * Типы для сущности пользователя
 * @layer entities/user
 */

export interface User {
  id: number
  documentId?: string // Может быть в Strapi 5
  username: string
  email: string
  provider: string
  confirmed: boolean
  blocked: boolean
  createdAt: string
  updatedAt: string
  role?: UserRole
  name?: string
  family?: string
  whatsapp_phone?: string
  telegram_username?: string
  telegram_phone?: string
  birth_date?: string
  bonusBalance?: number // Текущий баланс бонусов
  totalEarnedBonuses?: number // Всего заработано бонусов
  totalSpentBonuses?: number // Всего потрачено бонусов
}

export type UserRoleName = 'Manager' | 'Teacher' | 'Student' | 'Authenticated'

export interface UserRole {
  id: number
  name: UserRoleName
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

export interface UpdateUserData {
  name?: string
  family?: string
  whatsapp_phone?: string
  telegram_username?: string
  telegram_phone?: string
  birth_date?: string
}