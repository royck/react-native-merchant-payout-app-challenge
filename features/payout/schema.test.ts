import { payoutSchema } from './schema';

describe('payoutSchema', () => {
  it('accepts a positive amount and a valid IBAN', () => {
    expect(
      payoutSchema.safeParse({
        amount: '12.34',
        currency: 'GBP',
        iban: 'GB82 WEST 1234 5698 7654 32',
      }).success
    ).toBe(true);
  });

  it.each(['', '0', '-1', '1.001'])('rejects invalid amount %s', (amount) => {
    expect(
      payoutSchema.safeParse({
        amount,
        currency: 'GBP',
        iban: 'GB82 WEST 1234 5698 7654 32',
      }).success
    ).toBe(false);
  });

  it('rejects an invalid IBAN', () => {
    expect(
      payoutSchema.safeParse({
        amount: '10.00',
        currency: 'GBP',
        iban: 'GB81 WEST 1234 5698 7654 32',
      }).success
    ).toBe(false);
  });
});
