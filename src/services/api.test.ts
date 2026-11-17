import { ApiError, createPayout, readJsonResponse } from './api';

function response(status: number, body: string) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => body,
  };
}

describe('readJsonResponse', () => {
  it('parses JSON success responses', async () => {
    await expect(readJsonResponse(response(200, '{"available_balance":500000}')))
      .resolves.toEqual({ available_balance: 500000 });
  });

  describe('createPayout MSW error triggers', () => {
    const payout = {
      currency: 'GBP' as const,
      iban: 'GB82WEST12345698765432',
      device_id: 'test-device',
    };

    it.each([
      [99_999, 503, 'Service temporarily unavailable'],
      [88_888, 400, 'Insufficient funds'],
    ])('returns the documented error for %i minor units', async (amount, status, message) => {
      await expect(createPayout({ ...payout, amount })).rejects.toMatchObject({
        status,
        message,
      });
    });
  });

  it('reports an empty success response with its HTTP status', async () => {
    await expect(readJsonResponse(response(200, ''))).rejects.toThrow(
      'Server returned an empty response (HTTP 200)'
    );
  });

  it('reports malformed success JSON with its HTTP status', async () => {
    await expect(readJsonResponse(response(200, '{"activity":')))
      .rejects.toMatchObject({
        name: 'ApiError',
        status: 200,
        message: 'Server returned invalid JSON (HTTP 200)',
      } satisfies Partial<ApiError>);
  });

  it('preserves the status and message from JSON API errors', async () => {
    await expect(readJsonResponse(response(400, '{"error":"Insufficient funds"}')))
      .rejects.toMatchObject({
        name: 'ApiError',
        status: 400,
        message: 'Insufficient funds',
      } satisfies Partial<ApiError>);
  });

  it('preserves the HTTP status when an error body is empty', async () => {
    await expect(readJsonResponse(response(503, ''))).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      message: 'Request failed with status 503',
    });
  });
});
