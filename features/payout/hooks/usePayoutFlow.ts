import { useReducer } from 'react';

import type { PayoutError } from '@/features/payout/errors';
import type { PayoutDraft } from '@/features/payout/schema';
import type { PayoutResponse } from '@/types/api';

export type PayoutFlow =
  | { status: 'editing' }
  | { status: 'confirming'; draft: PayoutDraft }
  | { status: 'authenticating'; draft: PayoutDraft }
  | { status: 'submitting'; draft: PayoutDraft }
  | { status: 'result'; result: PayoutResponse }
  | { status: 'failed'; draft: PayoutDraft; error: PayoutError };

export type PayoutAction =
  | { type: 'REVIEW'; draft: PayoutDraft }
  | { type: 'EDIT' }
  | { type: 'AUTHENTICATE' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCEEDED'; result: PayoutResponse }
  | { type: 'FAILED'; draft: PayoutDraft; error: PayoutError }
  | { type: 'RESET' };

export function payoutFlowReducer(
  state: PayoutFlow,
  action: PayoutAction
): PayoutFlow {
  switch (action.type) {
    case 'REVIEW':
      return state.status === 'editing'
        ? { status: 'confirming', draft: action.draft }
        : state;
    case 'EDIT':
      return state.status === 'confirming' || state.status === 'failed'
        ? { status: 'editing' }
        : state;
    case 'AUTHENTICATE':
      return state.status === 'confirming' || state.status === 'failed'
        ? { status: 'authenticating', draft: state.draft }
        : state;
    case 'SUBMIT':
      return state.status === 'confirming' ||
        state.status === 'authenticating' ||
        state.status === 'failed'
        ? { status: 'submitting', draft: state.draft }
        : state;
    case 'SUCCEEDED':
      return state.status === 'submitting'
        ? { status: 'result', result: action.result }
        : state;
    case 'FAILED':
      return state.status === 'confirming' ||
        state.status === 'authenticating' ||
        state.status === 'submitting'
        ? { status: 'failed', draft: action.draft, error: action.error }
        : state;
    case 'RESET':
      return state.status === 'result' ? { status: 'editing' } : state;
    default:
      return assertNever(action);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unhandled payout action: ${JSON.stringify(value)}`);
}

export function usePayoutFlow() {
  return useReducer(payoutFlowReducer, { status: 'editing' });
}
