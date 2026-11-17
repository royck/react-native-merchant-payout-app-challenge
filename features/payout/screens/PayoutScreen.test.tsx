import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { KeyboardAvoidingView, ScrollView } from 'react-native';
import {
  getDeviceId,
  isBiometricAuthenticated,
} from '@/modules/screen-security/screen-security';

import { API_BASE_URL } from '@/constants';
import PayoutScreen from './PayoutScreen';
import { server } from '@/mocks/server.jest';

jest.mock('expo-router', () => {
  return { useFocusEffect: jest.fn() };
});

jest.mock('@/modules/screen-security/screen-security', () => ({
  addScreenshotListener: jest.fn(() => ({ remove: jest.fn() })),
  getDeviceId: jest.fn(async () => 'test-device'),
  isBiometricAuthenticated: jest.fn(async () => true),
  isScreenSecurityAvailable: jest.fn(() => true),
}));

const mockGetDeviceId = jest.mocked(getDeviceId);
const mockIsBiometricAuthenticated = jest.mocked(isBiometricAuthenticated);
let payoutRequestCount = 0;
let lastPayoutRequest: unknown;
let renderedQueryClient: QueryClient | undefined;

function renderPayoutScreen() {
  renderedQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={renderedQueryClient}>
      <PayoutScreen />
    </QueryClientProvider>
  );
}

function getPayoutAmount(value: unknown): number {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('amount' in value) ||
    typeof value.amount !== 'number'
  ) {
    throw new Error('Expected payout request amount');
  }
  return value.amount;
}

async function enterPayout(amount: string) {
  fireEvent.changeText(screen.getByLabelText('Payout amount'), amount);
  fireEvent.changeText(
    screen.getByLabelText('Destination IBAN'),
    'GB82 WEST 1234 5698 7654 32'
  );
  await waitFor(() => {
    expect(
      screen.getByRole('button', { name: 'Review payout' }).props.accessibilityState?.disabled
    ).toBe(false);
  });
  fireEvent.press(screen.getByRole('button', { name: 'Review payout' }));
  await screen.findByText('Confirm and send');
}

function watchPayoutRequests() {
  server.use(
    http.post(`${API_BASE_URL}/api/payouts`, async ({ request }) => {
      payoutRequestCount += 1;
      lastPayoutRequest = await request.json();
      return HttpResponse.json(
        {
          id: 'payout_test',
          amount: getPayoutAmount(lastPayoutRequest),
          currency: 'GBP',
          iban: 'GB82WEST12345698765432',
          status: 'completed',
          created_at: '2026-01-01T00:00:00.000Z',
        },
        { status: 201 }
      );
    })
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  payoutRequestCount = 0;
  lastPayoutRequest = undefined;
  mockGetDeviceId.mockResolvedValue('test-device');
  mockIsBiometricAuthenticated.mockResolvedValue(true);
});

afterEach(() => {
  cleanup();
  renderedQueryClient?.clear();
  renderedQueryClient = undefined;
});

describe('PayoutScreen critical flows', () => {
  it('keeps form taps enabled while the keyboard is open', () => {
    renderPayoutScreen();

    expect(screen.UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps)
      .toBe('handled');
    expect(screen.UNSAFE_getByType(KeyboardAvoidingView)).toBeTruthy();
  });

  it('does not send a payout when biometric authentication is cancelled', async () => {
    watchPayoutRequests();
    mockIsBiometricAuthenticated.mockResolvedValue(false);
    renderPayoutScreen();

    await enterPayout('1000.01');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(
      await screen.findByText(/Biometric authentication was cancelled or failed/)
    ).toBeTruthy();
    expect(mockIsBiometricAuthenticated).toHaveBeenCalledTimes(1);
    expect(payoutRequestCount).toBe(0);
    expect(mockGetDeviceId).not.toHaveBeenCalled();
  });

  it('shows the settings guidance when biometrics are not enrolled', async () => {
    watchPayoutRequests();
    mockIsBiometricAuthenticated.mockRejectedValue({
      code: 'ERR_BIOMETRIC_NOT_ENROLLED',
    });
    renderPayoutScreen();

    await enterPayout('1000.01');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(
      await screen.findByText(/Set up biometrics in your device settings/)
    ).toBeTruthy();
    expect(payoutRequestCount).toBe(0);
  });

  it('does not request biometrics at exactly £1,000 and includes device identity', async () => {
    watchPayoutRequests();
    renderPayoutScreen();

    await enterPayout('1000.00');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(await screen.findByText('Payout submitted')).toBeTruthy();
    expect(mockIsBiometricAuthenticated).not.toHaveBeenCalled();
    expect(payoutRequestCount).toBe(1);
    expect(lastPayoutRequest).toMatchObject({
      amount: 100_000,
      currency: 'GBP',
      device_id: 'test-device',
    });
  });

  it('authenticates for £1,000.01 and sends the exact minor-unit amount', async () => {
    watchPayoutRequests();
    renderPayoutScreen();

    await enterPayout('1000.01');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(await screen.findByText('Payout submitted')).toBeTruthy();
    expect(mockIsBiometricAuthenticated).toHaveBeenCalledTimes(1);
    expect(lastPayoutRequest).toMatchObject({ amount: 100_001 });
  });

  it('sends the selected currency in the payout request', async () => {
    watchPayoutRequests();
    renderPayoutScreen();

    fireEvent.press(screen.getByLabelText('Currency, GBP'));
    fireEvent.press(screen.getByRole('menuitem', { name: 'EUR' }));
    await enterPayout('10.00');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(await screen.findByText('Payout submitted')).toBeTruthy();
    expect(lastPayoutRequest).toMatchObject({ currency: 'EUR' });
  });

  it('rejects the invalid README IBAN example and keeps review disabled', async () => {
    renderPayoutScreen();

    fireEvent.changeText(screen.getByLabelText('Payout amount'), '10.00');
    fireEvent.changeText(
      screen.getByLabelText('Destination IBAN'),
      'FR1212345123451234567A12310131231231231'
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Review payout' }).props.accessibilityState?.disabled
      ).toBe(true);
    });
    expect(screen.getByText('Enter a valid IBAN, including its check digits.')).toBeTruthy();
  });

  it('shows the generic failure for an unexpected HTTP 500', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/payouts`, () =>
        HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
      )
    );
    renderPayoutScreen();

    await enterPayout('10.00');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(await screen.findByText('Internal server error')).toBeTruthy();
    expect(screen.queryByText(/Insufficient funds/i)).toBeNull();
    expect(screen.queryByText(/temporarily unavailable/i)).toBeNull();
  });

  it.each([
    ['777.77', 'Internal server error'],
    ['999.99', 'temporarily unavailable'],
    ['888.88', 'Insufficient funds'],
  ])('shows the correct mock-trigger error for %s', async (amount, message) => {
    renderPayoutScreen();

    await enterPayout(amount);
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(await screen.findByText(new RegExp(message, 'i'))).toBeTruthy();
  });

  it('prevents a second payout request from a rapid double tap', async () => {
    watchPayoutRequests();
    renderPayoutScreen();

    await enterPayout('10.00');
    const confirmButton = screen.getByRole('button', { name: 'Confirm and send' });
    fireEvent.press(confirmButton);
    fireEvent.press(confirmButton);

    await screen.findByText('Payout submitted');
    await waitFor(() => expect(payoutRequestCount).toBe(1));
  });

  it('shows a friendly message when the network request fails', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/payouts`, () => HttpResponse.error())
    );
    renderPayoutScreen();

    await enterPayout('10.00');
    fireEvent.press(screen.getByRole('button', { name: 'Confirm and send' }));

    expect(await screen.findByText(/Check your connection and try again/)).toBeTruthy();
  });
});
