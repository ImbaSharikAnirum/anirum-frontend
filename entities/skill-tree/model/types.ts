import { Media } from '@/entities/course/model/types'

// Типы для React Flow edges
export interface SkillEdge {
  id: string
  source: string
  target: string
  type?: string
}

export interface GuideEdge {
  id: string
  source: string
  target: string
  type?: string
}

// Модель Guide из Strapi
export interface Guide {
  id: number
  documentId: string
  title: string
  text?: string
  image?: Media
  link?: string
  approved?: boolean
  tags?: string[]
  pinterest_id?: string
  creationsCount?: number
  createdAt: string
  updatedAt: string
}

// Модель Skill из Strapi
export interface Skill {
  id: number
  documentId: string
  title: string // label в UI
  image?: Media // thumbnail в UI
  position: { x: number; y: number } // Позиция на канвасе
  guideEdges?: GuideEdge[] // Связи между гайдами
  guides?: Guide[] // Связанные гайды
  skill_tree?: SkillTree // Обратная связь на дерево
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

// Модель SkillTree из Strapi
export interface SkillTree {
  id: number
  documentId: string
  title: string
  image?: Media // thumbnail дерева
  description?: string
  skillEdges?: SkillEdge[] // Связи между навыками
  skills?: Skill[] // Связанные навыки
  owner?: {
    id: number
    documentId: string
    username: string
    email: string
  }
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

// Данные для создания дерева навыков
export interface CreateSkillTreeData {
  title: string
  description?: string
  image?: File
}

// Данные для обновления дерева навыков
export interface UpdateSkillTreeData {
  title?: string
  description?: string
  skillEdges?: SkillEdge[]
  image?: File
}

// Данные для создания навыка
export interface CreateSkillData {
  title: string
  position: { x: number; y: number }
  skill_tree: string // documentId дерева навыков
  image?: File
}

// Данные для обновления навыка
export interface UpdateSkillData {
  title?: string
  position?: { x: number; y: number }
  guideEdges?: GuideEdge[]
  image?: File
}
