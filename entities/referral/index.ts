/**
 * Реферальная система
 * @layer entities
 */

export { referralAPI } from './api/referralApi'
export type {
  ReferralCode,
  ValidateCodeRequest,
  ValidateCodeResponse,
  MyReferralCodeResponse,
  ReferralActivity,
  ReferralStats,
  AppliedReferral,
} from './model'