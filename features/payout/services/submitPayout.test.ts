import type { PayoutDraft } from '@/features/payout/schema';
import type { CreatePayoutRequest, PayoutResponse } from '@/types/api';
import { PAYOUT_BIOMETRIC_THRESHOLD } from '@/constants/security';
import { submitPayout } from './submitPayout';

const draft = (amount: string): PayoutDraft => ({
  amount,
  currency: 'GBP',
  iban: 'GB82WEST12345698765432',
});

const payoutResult: PayoutResponse = {
  id: 'payout_test',
  amount: 100_000,
  currency: 'GBP',
  iban: 'GB82WEST12345698765432',
  status: 'completed',
  created_at: '2026-01-01T00:00:00.000Z',
};

function dependencies() {
  const createPayout = jest.fn(
    async (_request: CreatePayoutRequest) => payoutResult
  );
  const isBiometricAuthenticated = jest.fn(async () => true);
  const getDeviceId = jest.fn(async () => 'test-device');
  return { createPayout, isBiometricAuthenticated, getDeviceId };
}

describe('submitPayout', () => {
  it('aborts above the threshold when biometric authentication fails', async () => {
    const deps = dependencies();
    deps.isBiometricAuthenticated.mockResolvedValue(false);

    await expect(submitPayout(draft('1000.01'), deps)).resolves.toEqual({
      kind: 'aborted',
      reason: 'biometric-failed',
    });
    expect(deps.createPayout).not.toHaveBeenCalled();
    expect(deps.getDeviceId).not.toHaveBeenCalled();
  });

  it('skips biometric authentication at exactly 1,000.00', async () => {
    const deps = dependencies();

    await submitPayout(draft('1000.00'), deps);

    expect(deps.isBiometricAuthenticated).not.toHaveBeenCalled();
    expect(deps.createPayout).toHaveBeenCalledWith({
      amount: PAYOUT_BIOMETRIC_THRESHOLD,
      currency: 'GBP',
      iban: 'GB82WEST12345698765432',
      device_id: 'test-device',
    });
  });

  it('authenticates before sending 1,000.01 as 100001 minor units', async () => {
    const deps = dependencies();
    const events: string[] = [];
    deps.isBiometricAuthenticated.mockImplementation(async () => {
      events.push('biometric');
      return true;
    });
    deps.createPayout.mockImplementation(async () => {
      events.push('payout');
      return payoutResult;
    });

    await submitPayout(draft('1000.01'), deps);

    expect(events).toEqual(['biometric', 'payout']);
    expect(deps.createPayout.mock.calls[0][0].amount).toBe(100_001);
  });

  it('preserves exact minor-unit conversion for the mock error trigger', async () => {
    const deps = dependencies();
    await submitPayout(draft('999.99'), deps);

    expect(deps.createPayout.mock.calls[0][0].amount).toBe(99_999);
  });
});
