/**
 * Типы для реферальной системы
 * @layer entities/referral
 */

export interface ReferralCode {
  id: number
  documentId: string
  code: string
  discountPercentage: number
  bonusPercentage: number
  maxUses: number
  currentUses: number
  isActive: boolean
  validFrom?: string
  validTo?: string
  minOrderAmount: number
  applicableToAll: boolean
  description?: string
  referrer?: {
    id: number
    documentId: string
    username: string
    name?: string
    family?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ValidateCodeRequest {
  code: string
  coursePrice: number
}

export interface ValidateCodeResponse {
  isValid: boolean
  error?: string
  referralCode?: ReferralCode
  discountAmount?: number
  referrerBonus?: number
  referrer?: {
    id: number
    documentId: string
    username: string
  }
}

export interface MyReferralCodeResponse {
  referralCode: ReferralCode
}

export interface ReferralActivity {
  date: string
  studentName: string
  course: string
  amount: number
  status: 'paid' | 'pending' | 'cancelled'
}

export interface ReferralStats {
  totalCodes: number
  totalUses: number
  totalEarned: number
  recentActivity: ReferralActivity[]
}

export interface AppliedReferral {
  code: string
  discountAmount: number
  referralCodeId: string | number
  referrerId: string | number
}