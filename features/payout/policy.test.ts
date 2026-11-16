import { PAYOUT_BIOMETRIC_THRESHOLD } from '@/constants/security';
import { requiresBiometric } from './policy';

describe('requiresBiometric', () => {
  it('does not require biometrics at the threshold', () => {
    expect(requiresBiometric(PAYOUT_BIOMETRIC_THRESHOLD)).toBe(false);
  });

  it('requires biometrics above the threshold', () => {
    expect(requiresBiometric(PAYOUT_BIOMETRIC_THRESHOLD + 1)).toBe(true);
  });
});
