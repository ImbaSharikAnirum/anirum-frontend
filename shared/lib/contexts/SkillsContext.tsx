'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'

interface SkillsContextType {
  addGuideToFlow: ((guideData: { id: string; numericId?: number; title: string; thumbnail?: string }) => void) | null
  setAddGuideToFlow: (fn: ((guideData: { id: string; numericId?: number; title: string; thumbnail?: string }) => void) | null) => void
  isSkillMode: boolean
  setIsSkillMode: (value: boolean) => void
  isOwnTree: boolean
  setIsOwnTree: (value: boolean) => void
  isEditMode: boolean
  setIsEditMode: (value: boolean) => void
}

const SkillsContext = createContext<SkillsContextType | undefined>(undefined)

export function SkillsProvider({ children }: { children: ReactNode }) {
  const [addGuideToFlow, setAddGuideToFlow] = useState<((guideData: { id: string; numericId?: number; title: string; thumbnail?: string }) => void) | null>(null)
  const [isSkillMode, setIsSkillMode] = useState(false)
  const [isOwnTree, setIsOwnTree] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  return (
    <SkillsContext.Provider value={{ addGuideToFlow, setAddGuideToFlow, isSkillMode, setIsSkillMode, isOwnTree, setIsOwnTree, isEditMode, setIsEditMode }}>
      {children}
    </SkillsContext.Provider>
  )
}

export function useSkills() {
  const context = useContext(SkillsContext)
  if (context === undefined) {
    throw new Error('useSkills must be used within a SkillsProvider')
  }
  return context
}
