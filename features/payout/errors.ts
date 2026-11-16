import { ApiError } from '@/src/services/api';
import { getBiometricErrorCode } from '@/modules/screen-security/errors';

export type PayoutErrorKind =
  | 'biometric'
  | 'biometric-locked-out'
  | 'biometric-not-available'
  | 'biometric-not-enrolled'
  | 'insufficient-funds'
  | 'invalid-request'
  | 'service-unavailable'
  | 'network'
  | 'unknown';

export interface PayoutError {
  kind: PayoutErrorKind;
  message: string;
}

export function mapPayoutError(error: unknown): PayoutError {
  const biometricCode = getBiometricErrorCode(error);
  if (biometricCode === 'ERR_BIOMETRIC_NOT_ENROLLED') {
    return {
      kind: 'biometric-not-enrolled',
      message: 'Set up biometrics in your device settings before confirming this payout.',
    };
  }
  if (biometricCode === 'ERR_BIOMETRIC_NOT_AVAILABLE') {
    return {
      kind: 'biometric-not-available',
      message: 'Biometric authentication is unavailable on this device. Your payout was not submitted.',
    };
  }
  if (biometricCode === 'ERR_BIOMETRIC_LOCKED_OUT') {
    return {
      kind: 'biometric-locked-out',
      message: 'Biometric authentication is locked. Try again later; your payout was not submitted.',
    };
  }
  if (biometricCode === 'ERR_BIOMETRIC_UNKNOWN') {
    return {
      kind: 'biometric',
      message: 'Biometric authentication failed. Your payout was not submitted.',
    };
  }
  if (
    error instanceof ApiError &&
    error.status === 400 &&
    /insufficient funds/i.test(error.message)
  ) {
    return { kind: 'insufficient-funds', message: `Insufficient funds: ${error.message}` };
  }
  if (error instanceof ApiError && error.status === 400) {
    return {
      kind: 'invalid-request',
      message: 'Payout details were rejected. Check the amount and bank details, then try again.',
    };
  }
  if (error instanceof ApiError && error.status === 503) {
    return {
      kind: 'service-unavailable',
      message: 'Payout service is temporarily unavailable. Please try again later.',
    };
  }
  if (error instanceof ApiError && error.status === 0) {
    return {
      kind: 'network',
      message: 'Network request failed. Check your connection and try again.',
    };
  }
  return {
    kind: 'unknown',
    message: error instanceof Error ? error.message : 'Payout failed.',
  };
}
