import { API_BASE_URL } from '@/constants';
import type {
  CreatePayoutRequest,
  MerchantDataResponse,
  PaginatedActivityResponse,
  PayoutResponse,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function readJsonResponse<T>(
  response: Pick<Response, 'status' | 'ok' | 'text'>
): Promise<T> {
  const text = await response.text();
  let body: unknown;

  if (text.length > 0) {
    try {
      body = JSON.parse(text);
    } catch {
      const message = response.ok
        ? `Server returned invalid JSON (HTTP ${response.status})`
        : `Request failed with status ${response.status}; the error response was not valid JSON`;
      throw new ApiError(message, response.status);
    }
  } else if (response.ok) {
    throw new ApiError(`Server returned an empty response (HTTP ${response.status})`, response.status);
  }

  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string'
        ? body.error
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError('Network request failed', 0);
  }
  return readJsonResponse<T>(response);
}

export function getMerchant(): Promise<MerchantDataResponse> {
  return request('/api/merchant');
}

export function getActivity(
  cursor: string | null,
  limit = 15
): Promise<PaginatedActivityResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.set('cursor', cursor);
  }
  return request(`/api/merchant/activity?${params.toString()}`);
}

export function createPayout(
  payout: CreatePayoutRequest
): Promise<PayoutResponse> {
  return request('/api/payouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payout),
  });
}
