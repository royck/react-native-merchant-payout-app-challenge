import type { CreatePayoutRequest, PayoutResponse } from '@/types/api';
import type { PayoutDraft } from '@/features/payout/schema';
import { requiresBiometric } from '@/features/payout/policy';
import { parseMoneyInput } from '@/lib/money';

export type PayoutSubmission =
  | { kind: 'aborted'; reason: 'biometric-failed' }
  | { kind: 'submitted'; result: PayoutResponse };

export interface SubmitPayoutDependencies {
  isBiometricAuthenticated: () => Promise<boolean>;
  getDeviceId: () => Promise<string>;
  createPayout: (request: CreatePayoutRequest) => Promise<PayoutResponse>;
  onBiometricRequired?: () => void;
  onSubmitting?: () => void;
}

export async function submitPayout(
  draft: PayoutDraft,
  dependencies: SubmitPayoutDependencies
): Promise<PayoutSubmission> {
  const amount = parseMoneyInput(draft.amount);
  if (amount === null || amount <= 0) {
    throw new Error('Cannot submit an invalid payout amount.');
  }

  if (requiresBiometric(amount)) {
    dependencies.onBiometricRequired?.();
    const authenticated = await dependencies.isBiometricAuthenticated();
    if (!authenticated) {
      return { kind: 'aborted', reason: 'biometric-failed' };
    }
  }

  dependencies.onSubmitting?.();
  const deviceId = await dependencies.getDeviceId();
  const result = await dependencies.createPayout({
    amount,
    currency: draft.currency,
    iban: draft.iban.replace(/\s/g, '').toUpperCase(),
    device_id: deviceId,
  });

  return { kind: 'submitted', result };
}
