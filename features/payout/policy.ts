import { PAYOUT_BIOMETRIC_THRESHOLD } from '@/constants/security';

export function requiresBiometric(amountMinorUnits: number): boolean {
  return amountMinorUnits > PAYOUT_BIOMETRIC_THRESHOLD;
}
