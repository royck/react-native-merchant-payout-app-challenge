export const BIOMETRIC_ERROR_CODES = [
  'ERR_BIOMETRIC_NOT_ENROLLED',
  'ERR_BIOMETRIC_NOT_AVAILABLE',
  'ERR_BIOMETRIC_LOCKED_OUT',
  'ERR_BIOMETRIC_UNKNOWN',
] as const;

export type BiometricErrorCode = (typeof BIOMETRIC_ERROR_CODES)[number];

export function getBiometricErrorCode(error: unknown): BiometricErrorCode | null {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return null;
  }

  const { code } = error;
  return typeof code === 'string'
    ? BIOMETRIC_ERROR_CODES.find((knownCode) => knownCode === code) ?? null
    : null;
}

export function isBiometricErrorCode(code: string): code is BiometricErrorCode {
  return BIOMETRIC_ERROR_CODES.some((knownCode) => knownCode === code);
}
