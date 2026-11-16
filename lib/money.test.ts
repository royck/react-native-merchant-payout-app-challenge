import { formatMoney, parseMoneyInput } from './money';

describe('parseMoneyInput', () => {
  it.each([
    ['5000', 500000],
    ['12.3', 1230],
    ['12.34', 1234],
    ['0.01', 1],
  ])('parses %s to minor units', (input, expected) => {
    expect(parseMoneyInput(input)).toBe(expected);
  });

  it.each(['', '0.001', '-1', '01.00', '1.', '.50', '1,50'])(
    'rejects invalid amount %s',
    (input) => {
      expect(parseMoneyInput(input)).toBeNull();
    }
  );
});

describe('formatMoney', () => {
  it('formats GBP minor units', () => {
    expect(formatMoney(500000, 'GBP')).toBe('£5,000.00');
  });

  it('formats EUR minor units', () => {
    expect(formatMoney(12345, 'EUR')).toBe('€123.45');
  });
});
