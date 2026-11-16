import { payoutFlowReducer, type PayoutFlow } from './usePayoutFlow';
import type { PayoutDraft } from '@/features/payout/schema';
import type { PayoutResponse } from '@/types/api';

const draft: PayoutDraft = {
  amount: '12.34',
  currency: 'GBP',
  iban: 'GB82WEST12345698765432',
};

const result: PayoutResponse = {
  id: 'payout_test',
  amount: 1234,
  currency: 'GBP',
  iban: draft.iban,
  status: 'completed',
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('payoutFlowReducer', () => {
  it('moves through review, submission, success and reset', () => {
    const confirming = payoutFlowReducer({ status: 'editing' }, { type: 'REVIEW', draft });
    expect(confirming).toEqual({ status: 'confirming', draft });

    const submitting = payoutFlowReducer(confirming, { type: 'SUBMIT' });
    expect(submitting).toEqual({ status: 'submitting', draft });

    const success = payoutFlowReducer(submitting, { type: 'SUCCEEDED', result });
    expect(success).toEqual({ status: 'result', result });
    expect(payoutFlowReducer(success, { type: 'RESET' })).toEqual({ status: 'editing' });
  });

  it('ignores actions that are invalid for the current state', () => {
    const initial: PayoutFlow = { status: 'editing' };
    expect(payoutFlowReducer(initial, { type: 'SUBMIT' })).toBe(initial);
    expect(payoutFlowReducer(initial, { type: 'SUCCEEDED', result })).toBe(initial);
    expect(payoutFlowReducer(initial, { type: 'RESET' })).toBe(initial);
  });
});
