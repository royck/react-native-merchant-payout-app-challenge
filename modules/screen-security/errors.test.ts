import { getBiometricErrorCode } from './errors';

describe('getBiometricErrorCode', () => {
  it('returns known biometric codes', () => {
    expect(getBiometricErrorCode({ code: 'ERR_BIOMETRIC_NOT_ENROLLED' }))
      .toBe('ERR_BIOMETRIC_NOT_ENROLLED');
  });

  it('ignores unknown and malformed errors', () => {
    expect(getBiometricErrorCode({ code: 'ERR_OTHER' })).toBeNull();
    expect(getBiometricErrorCode({ code: 123 })).toBeNull();
    expect(getBiometricErrorCode(null)).toBeNull();
    expect(getBiometricErrorCode('failure')).toBeNull();
  });
});
