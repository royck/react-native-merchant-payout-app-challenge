import { ApiError } from '@/src/services/api';
import { mapPayoutError } from './errors';

describe('mapPayoutError', () => {
  it('maps insufficient funds and service errors distinctly', () => {
    expect(mapPayoutError(new ApiError('Insufficient funds', 400)).kind)
      .toBe('insufficient-funds');
    expect(mapPayoutError(new ApiError('Unavailable', 503)).kind)
      .toBe('service-unavailable');
  });

  it('does not label other bad requests as insufficient funds', () => {
    expect(mapPayoutError(new ApiError('Invalid payout details', 400)).kind)
      .toBe('invalid-request');
  });

  it('maps network failures separately from unexpected errors', () => {
    expect(mapPayoutError(new ApiError('Network request failed', 0)).kind).toBe('network');
    expect(mapPayoutError(new Error('Unexpected error')).kind).toBe('unknown');
  });

  it('maps unexpected server errors to the generic failure category', () => {
    expect(mapPayoutError(new ApiError('Internal server error', 500)).kind).toBe('unknown');
  });

  it('maps coded biometric errors without relying on native error messages', () => {
    expect(mapPayoutError({ code: 'ERR_BIOMETRIC_NOT_ENROLLED' }).kind)
      .toBe('biometric-not-enrolled');
    expect(mapPayoutError({ code: 'ERR_BIOMETRIC_LOCKED_OUT' }).kind)
      .toBe('biometric-locked-out');
  });
});
