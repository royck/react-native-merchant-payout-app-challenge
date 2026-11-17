/**
 * MSW Request Handlers
 */
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../constants';
import {
  createPayout,
  getPayoutById,
  generateMockActivity,
  getPaginatedActivity,
  getAvailableBalance,
  getPendingBalance,
  getCurrentCurrency,
} from './data';
import type {
  MerchantDataResponse,
  CreatePayoutRequest,
  PaginatedActivityResponse,
} from '../types/api';

function isCreatePayoutRequest(value: unknown): value is CreatePayoutRequest {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const payout = value as Record<string, unknown>;
  return (
    typeof payout.amount === 'number' &&
    Number.isSafeInteger(payout.amount) &&
    payout.amount > 0 &&
    (payout.currency === 'GBP' || payout.currency === 'EUR') &&
    typeof payout.iban === 'string' &&
    typeof payout.device_id === 'string' &&
    payout.device_id.length > 0
  );
}

function logRequest(
  method: string,
  url: string,
  status: number
) {
  let statusColor = '#4CAF50'; // Green for 2xx
  if (status >= 400 && status < 500) {
    statusColor = '#FF9800'; // Orange for 4xx
  } else if (status >= 500) {
    statusColor = '#F44336'; // Red for 5xx
  }

  const mswStyle = 'color: #9C27B0; font-weight: bold;';
  const methodStyle = 'color: #2196F3; font-weight: bold;';
  const statusStyle = `color: ${statusColor}; font-weight: bold;`;
  const logMessage = `%c[MSW]%c %c${method}%c ${url} → %c${status}`;
  console.log(
    logMessage,
    mswStyle,
    '', // Reset after [MSW]
    methodStyle,
    '', // Reset after method
    statusStyle
  );

}

function jsonResponse(body: object, init?: ResponseInit) {
  const response = HttpResponse.json(body, init);

  // React Native's Response polyfill does not expose a body stream; MSW's
  // fetch interceptor reads this property to construct the intercepted response.
  if (typeof response.body === 'undefined') {
    Object.defineProperty(response, 'body', { value: JSON.stringify(body) });
  }

  return response;
}

export const handlers = [
  // GET /api/merchant
  http.get(`${API_BASE_URL}/api/merchant`, async ({ request }) => {
    // Add random timeout to simulate network latency (500-2000ms)
    const delay = Math.floor(Math.random() * 1500) + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Check for error simulation header
    const errorHeader = request.headers.get('x-simulate-error');
    if (errorHeader) {
      const errorResponse = { error: 'Internal Server Error' };
      logRequest('GET', request.url, 500);
      return jsonResponse(errorResponse, { status: 500 });
    }

    // Parse cursor from query parameters
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '15', 10);

    // If cursor is provided, return paginated activity response
    if (cursor !== null) {
      const paginatedActivity = getPaginatedActivity(cursor, limit);
      const response: PaginatedActivityResponse = paginatedActivity;

      logRequest('GET', request.url, 200);
      return jsonResponse(response);
    }

    // Otherwise, return full merchant data (for backward compatibility)
    const response: MerchantDataResponse = {
      available_balance: getAvailableBalance(),
      pending_balance: getPendingBalance(),
      currency: getCurrentCurrency(),
      activity: generateMockActivity(),
    };

    logRequest('GET', request.url, 200);
    return jsonResponse(response);
  }),

  // GET /api/merchant/activity - Dedicated endpoint for paginated activity
  http.get(`${API_BASE_URL}/api/merchant/activity`, async ({ request }) => {
    // Add random timeout to simulate network latency (500-2000ms)
    const delay = Math.floor(Math.random() * 1500) + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Parse cursor and limit from query parameters
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '15', 10);

    const paginatedActivity = getPaginatedActivity(cursor, limit);
    const response: PaginatedActivityResponse = paginatedActivity;

    logRequest('GET', request.url, 200);
    return jsonResponse(response);
  }),

  // POST /api/payouts
  http.post(`${API_BASE_URL}/api/payouts`, async ({ request }) => {
    const requestText = await request.text();
    let requestBody: unknown;
    try {
      requestBody = JSON.parse(requestText);
    } catch {
      const errorResponse = { error: 'Request body must contain valid JSON' };
      logRequest('POST', request.url, 400);
      return jsonResponse(errorResponse, { status: 400 });
    }

    if (!isCreatePayoutRequest(requestBody)) {
      const errorResponse = { error: 'Request body is missing valid payout details' };
      logRequest('POST', request.url, 400);
      return jsonResponse(errorResponse, { status: 400 });
    }

    const body = requestBody;
    const { amount, currency, iban } = body;

    // Internal Server Error: amount === 77777 (777.77) returns 500
    if (amount === 77777) {
      const errorResponse = { error: 'Internal server error' };
      logRequest('POST', request.url, 500);
      return jsonResponse(errorResponse, { status: 500 });
    }

    // Service Unavailable: amount === 99999 (999.99 in pence) returns 503
    if (amount === 99999) {
      const errorResponse = { error: 'Service temporarily unavailable' };
      logRequest('POST', request.url, 503);
      return jsonResponse(errorResponse, { status: 503 });
    }

    // Insufficient Funds: amount === 88888 (888.88 in pence) returns 400
    if (amount === 88888) {
      const errorResponse = { error: 'Insufficient funds' };
      logRequest('POST', request.url, 400);
      return jsonResponse(errorResponse, { status: 400 });
    }

    // Success: Create payout with final status immediately (no polling needed)
    // Determine final status: fail if amount ends in 99 pence, otherwise complete
    const finalStatus = amount % 100 === 99 ? 'failed' : 'completed';
    const payout = createPayout(amount, currency, iban, finalStatus);
    
    logRequest('POST', request.url, 201);
    return jsonResponse(payout, { status: 201 });
  }),

  // GET /api/payouts/:id
  http.get(`${API_BASE_URL}/api/payouts/:id`, ({ params, request }) => {
    const { id } = params;
    const payout = getPayoutById(id as string);

    if (!payout) {
      const errorResponse = { error: 'Payout not found' };
      logRequest('GET', request.url, 404);
      return jsonResponse(errorResponse, { status: 404 });
    }

    logRequest('GET', request.url, 200);
    return jsonResponse(payout);
  }),
];
